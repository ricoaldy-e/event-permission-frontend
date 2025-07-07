<template>
  <div class="dashboard-container">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">
      Dashboard Verifikator
    </h2>
    <p class="text-gray-700 mb-8 text-center">
      Selamat datang,
      <span class="font-semibold">{{ authStore.username || "Pengguna" }}</span>
      (Role:
      <span class="font-semibold">{{
        authStore.userRole || "Tidak Diketahui"
      }}</span
      >)!
    </p>

    <h3 class="text-2xl font-bold text-gray-800 mb-4">
      Antrian Verifikasi Acara
    </h3>

    <div
      v-if="loadingVerificationEvents"
      class="text-blue-500 text-center py-8"
    >
      <div
        class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"
      ></div>
      <p class="mt-2">Memuat antrian verifikasi...</p>
    </div>
    <div v-else-if="verificationError" class="text-red-500 text-center py-8">
      <p>
        Terjadi kesalahan saat mengambil antrian verifikasi:
        {{ verificationError.message }}
      </p>
    </div>
    <ul v-else-if="verificationQueue.length" class="space-y-4">
      <li
        v-for="event in verificationQueue"
        :key="event.id"
        class="bg-white p-4 rounded-md shadow-sm border border-gray-200"
      >
        <div class="flex justify-between items-start">
          <div>
            <h4 class="text-xl font-semibold text-gray-800">
              {{ event.nama_acara }}
            </h4>
            <p class="text-gray-700">
              Penyelenggara: {{ event.penyelenggara }}
            </p>
            <p class="text-gray-600">Lokasi: {{ event.lokasi }}</p>
            <p class="text-gray-600">
              Tanggal: {{ event.tanggal_mulai }} - {{ event.tanggal_selesai }}
            </p>
            <p class="text-gray-500 text-sm mt-1">
              Dibuat oleh: {{ event.user_id }}
            </p>
            <p v-if="event.verified_at" class="text-green-600 text-sm mt-2">
              Terverifikasi pada:
              {{ new Date(event.verified_at).toLocaleDateString() }} oleh
              {{ event.verified_by }}
            </p>
          </div>
          <div>
            <button
              v-if="!event.verified_at"
              @click="confirmVerification(event.id)"
              class="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded-md transition-colors duration-200"
            >
              Verifikasi
            </button>
            <button
              @click="showEventDetail(event)"
              class="ml-2 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded-md transition-colors duration-200"
            >
              Detail
            </button>
          </div>
        </div>
      </li>
    </ul>
    <p v-else class="text-gray-500 text-center py-8">
      Tidak ada acara yang perlu diverifikasi dari operator pasangan Anda.
    </p>

    <div
      v-if="selectedEvent"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-2xl font-bold text-gray-800">
            {{ selectedEvent.nama_acara }}
          </h3>
          <button
            @click="closeEventDetail"
            class="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
        </div>
        <div class="space-y-3 text-gray-700">
          <p>
            <span class="font-semibold">Penyelenggara:</span>
            {{ selectedEvent.penyelenggara }}
          </p>
          <p>
            <span class="font-semibold">Jumlah Peserta:</span>
            {{ selectedEvent.jumlah_peserta }}
          </p>
          <p>
            <span class="font-semibold">Tanggal:</span>
            {{ selectedEvent.tanggal_mulai }} -
            {{ selectedEvent.tanggal_selesai }}
          </p>
          <p v-if="selectedEvent.jam_mulai && selectedEvent.jam_selesai">
            <span class="font-semibold">Jam:</span>
            {{ selectedEvent.jam_mulai }} - {{ selectedEvent.jam_selesai }}
          </p>
          <p>
            <span class="font-semibold">Lokasi:</span>
            {{ selectedEvent.lokasi }}, {{ selectedEvent.kota?.nama }},
            {{ selectedEvent.provinsi?.nama }}
          </p>
          <p v-if="selectedEvent.kategoriAcara">
            <span class="font-semibold">Kategori:</span>
            {{ selectedEvent.kategoriAcara.nama }}
          </p>
          <p v-if="selectedEvent.biaya">
            <span class="font-semibold">Biaya:</span> {{ selectedEvent.biaya }}
          </p>
          <p v-if="selectedEvent.deskripsi">
            <span class="font-semibold">Deskripsi:</span>
            {{ selectedEvent.deskripsi }}
          </p>
          <p v-if="selectedEvent.dokumentasi_url">
            <span class="font-semibold">Dokumentasi:</span>
            <a
              :href="selectedEvent.dokumentasi_url"
              target="_blank"
              class="text-blue-500 hover:underline"
              >Link</a
            >
          </p>

          <h4
            v-if="
              selectedEvent.pengisiEvent && selectedEvent.pengisiEvent.length
            "
            class="text-lg font-semibold mt-4"
          >
            Pengisi Acara:
          </h4>
          <ul
            v-if="
              selectedEvent.pengisiEvent && selectedEvent.pengisiEvent.length
            "
            class="list-disc list-inside space-y-1"
          >
            <li v-for="pengisi in selectedEvent.pengisiEvent" :key="pengisi.id">
              {{ pengisi.nama_pengisi }} (Materi: {{ pengisi.judul_materi }})
            </li>
          </ul>

          <p
            v-if="selectedEvent.verified_at"
            class="text-green-600 text-sm mt-4"
          >
            Terverifikasi pada:
            {{ new Date(selectedEvent.verified_at).toLocaleDateString() }} oleh
            {{ selectedEvent.verified_by }}
          </p>
        </div>
        <div class="mt-6 text-right">
          <button
            @click="closeEventDetail"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="showVerifyConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl text-center"
      >
        <p class="text-lg font-semibold mb-4">
          Apakah Anda yakin ingin memverifikasi acara ini?
        </p>
        <p class="text-sm text-gray-600 mb-6">
          Tindakan ini tidak dapat dibatalkan.
        </p>
        <div class="flex justify-center space-x-4">
          <button
            @click="cancelVerification"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md"
          >
            Batal
          </button>
          <button
            @click="executeVerification"
            class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md"
          >
            Verifikasi
          </button>
        </div>
      </div>
    </div>

    <button @click="logout" class="logout-button mt-8">Logout</button>
  </div>
</template>

<script setup>
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { useQuery, useMutation } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { ref, watch, computed } from "vue";

const authStore = useAuthStore();
const router = useRouter();

const verificationQueue = ref([]);
const loadingVerificationEvents = ref(true);
const verificationError = ref(null);

const selectedEvent = ref(null);

const showVerifyConfirm = ref(false);
const eventIdToVerify = ref(null);

const GET_VERIFICATION_QUEUE_QUERY = gql`
  query GetEventPermissionVerifikasiList($pagination: PaginationInput) {
    getEventPermissionVerifikasiList(pagination: $pagination) {
      data {
        id
        nama_acara
        penyelenggara
        lokasi
        tanggal_mulai
        tanggal_selesai
        user_id
        verified_at
        verified_by
        jumlah_peserta
        jam_mulai
        jam_selesai
        provinsi {
          id
          nama
        }
        kota {
          id
          nama
        }
        kategoriAcara {
          id
          nama
        }
        biaya
        deskripsi
        dokumentasi_url
        pengisiEvent {
          id
          nama_pengisi
          judul_materi
        }
      }
      total
      totalFiltered
    }
  }
`;

const VERIFY_EVENT_PERMISSION_MUTATION = gql`
  mutation VerifyEventPermission($id: String!) {
    verifyEventPermission(id: $id) {
      id
      nama_acara
      verified_at
      verified_by
    }
  }
`;

const {
  result: verificationResult,
  loading: loadingVerification,
  error: verifError,
  refetch: refetchVerificationEvents,
} = useQuery(
  GET_VERIFICATION_QUEUE_QUERY,
  () => ({
    pagination: {
      take: 100,
    },
  }),
  {
    enabled: computed(() => authStore.userRole === "verifikator"),
  }
);

watch(verificationResult, (newResult) => {
  if (newResult && newResult.getEventPermissionVerifikasiList) {
    verificationQueue.value =
      newResult.getEventPermissionVerifikasiList.data.filter(
        (event) => !event.verified_at
      );
    loadingVerificationEvents.value = false;
  } else if (!loadingVerification.value) {
    verificationQueue.value = [];
    loadingVerificationEvents.value = false;
  }
});
watch(verifError, (err) => {
  verificationError.value = err;
  loadingVerificationEvents.value = false;
});

const { mutate: verifyEvent } = useMutation(VERIFY_EVENT_PERMISSION_MUTATION);

const confirmVerification = (eventId) => {
  eventIdToVerify.value = eventId;
  showVerifyConfirm.value = true;
};

const cancelVerification = () => {
  eventIdToVerify.value = null;
  showVerifyConfirm.value = false;
};

const executeVerification = async () => {
  if (!eventIdToVerify.value) return;
  try {
    await verifyEvent({ id: eventIdToVerify.value });
    alert("Acara berhasil diverifikasi!");
    cancelVerification();
    refetchVerificationEvents();
  } catch (e) {
    console.error("Error verifying event:", e);
    alert(`Gagal memverifikasi acara: ${e.message || "Terjadi kesalahan."}`);
  }
};

const showEventDetail = (event) => {
  selectedEvent.value = event;
};

const closeEventDetail = () => {
  selectedEvent.value = null;
};

const logout = () => {
  authStore.logout();
  router.push("/login");
};
</script>

<style scoped>
.dashboard-container {
  @apply bg-white p-8 rounded-lg shadow-md;
}

.logout-button {
  @apply px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-md transition-colors duration-200;
}
</style>
