<template>
  <div class="bg-white p-6 rounded-lg shadow-md mb-6">
    <h1 class="text-3xl font-bold text-center text-gray-800 mb-4">
      Selamat Datang di Sistem Perizinan Acara
    </h1>
    <p class="text-gray-600 text-center mb-6">
      Jelajahi berbagai acara yang sudah terverifikasi di sini.
    </p>
    <router-link
      to="/login"
      class="inline-block bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
    >
      Login
    </router-link>
  </div>

  <div class="bg-white p-6 rounded-lg shadow-md mt-8">
    <h2 class="text-2xl font-bold text-gray-800 mb-4 text-center">
      Acara Terverifikasi
    </h2>

    <div
      class="flex flex-col sm:flex-row justify-between items-center mb-6 space-y-4 sm:space-y-0"
    >
      <input
        type="text"
        v-model="searchQuery"
        @input="debouncedSearch"
        placeholder="Cari nama acara, penyelenggara, atau lokasi..."
        class="flex-grow p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-sm"
      />
      <div class="flex items-center space-x-2">
        <button
          @click="prevPage"
          :disabled="currentPage === 1 || loadingEvents"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <span class="text-gray-700"
          >Page {{ currentPage }} of {{ totalPages }}</span
        >
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages || loadingEvents"
          class="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
    </div>

    <div v-if="loadingEvents" class="text-blue-500 text-center py-8">
      <div
        class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"
      ></div>
      <p class="mt-2">Memuat acara...</p>
    </div>
    <div v-else-if="eventError" class="text-red-500 text-center py-8">
      <p>Terjadi kesalahan saat mengambil acara: {{ eventError.message }}</p>
    </div>
    <ul v-else-if="events.length" class="space-y-4">
      <li
        v-for="event in events"
        :key="event.id"
        class="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200"
      >
        <h3 class="text-xl font-semibold text-gray-800">
          {{ event.nama_acara }}
        </h3>
        <p class="text-gray-700">Penyelenggara: {{ event.penyelenggara }}</p>
        <p class="text-gray-600">Lokasi: {{ event.lokasi }}</p>
        <p class="text-gray-600">
          Tanggal: {{ event.tanggal_mulai }} - {{ event.tanggal_selesai }}
        </p>
        <p v-if="event.verified_at" class="text-green-600 text-sm mt-2">
          Terverifikasi pada:
          {{ new Date(event.verified_at).toLocaleDateString() }} oleh
          {{ event.verified_by }}
        </p>
        <button
          @click="showEventDetail(event)"
          class="mt-3 bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded-md transition-colors duration-200"
        >
          Lihat Detail
        </button>
      </li>
    </ul>
    <p v-else class="text-gray-500 text-center py-8">
      Tidak ada acara terverifikasi yang ditemukan.
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
  </div>
</template>

<script setup>
import { useQuery } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { ref, watch, computed } from "vue";
import { useDebounceFn } from "@vueuse/core";

const searchQuery = ref("");
const currentPage = ref(1);
const itemsPerPage = 5;
const totalItems = ref(0);
const totalFilteredItems = ref(0);

const selectedEvent = ref(null);

const GET_PUBLIC_EVENT_PERMISSIONS = gql`
  query GetEventPermissionList($pagination: PaginationInput, $user_id: String) {
    getEventPermissionList(pagination: $pagination, user_id: $user_id) {
      data {
        id
        nama_acara
        penyelenggara
        jumlah_peserta
        tanggal_mulai
        tanggal_selesai
        jam_mulai
        jam_selesai
        lokasi
        verified_at
        verified_by
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

const GET_PROVINSI_QUERY = gql`
  query GetProvinsi {
    getProvinsi {
      id
      kode
      nama
    }
  }
`;

const {
  result: eventResult,
  loading: loadingEvents,
  error: eventError,
  refetch: refetchEvents,
} = useQuery(GET_PUBLIC_EVENT_PERMISSIONS, () => ({
  pagination: {
    take: itemsPerPage,
    skip: (currentPage.value - 1) * itemsPerPage,
    search: searchQuery.value,
  },
}));

const { result: provinsiResult } = useQuery(GET_PROVINSI_QUERY);

const events = ref([]);
const provinsis = ref([]);

watch(eventResult, (newResult) => {
  if (newResult && newResult.getEventPermissionList) {
    events.value = newResult.getEventPermissionList.data;
    totalItems.value = newResult.getEventPermissionList.total;
    totalFilteredItems.value = newResult.getEventPermissionList.totalFiltered;
  }
});

watch(provinsiResult, (newResult) => {
  if (newResult && newResult.getProvinsi) {
    provinsis.value = newResult.getProvinsi;
  }
});

const totalPages = computed(() => {
  return Math.ceil(totalFilteredItems.value / itemsPerPage);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const debouncedSearch = useDebounceFn(() => {
  currentPage.value = 1;
  refetchEvents();
}, 500);

const showEventDetail = (event) => {
  selectedEvent.value = event;
};

const closeEventDetail = () => {
  selectedEvent.value = null;
};
</script>
