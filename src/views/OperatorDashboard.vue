<template>
  <div class="dashboard-container">
    <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">
      Dashboard Operator
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

    <button
      @click="openCreateModal"
      class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md mb-6 transition-colors duration-200"
    >
      + Tambah Acara Baru
    </button>

    <h3 class="text-2xl font-bold text-gray-800 mb-4">Daftar Acara Saya</h3>

    <div v-if="loadingEvents" class="text-blue-500 text-center py-8">
      <div
        class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto"
      ></div>
      <p class="mt-2">Memuat acara Anda...</p>
    </div>
    <div v-else-if="eventError" class="text-red-500 text-center py-8">
      <p>Terjadi kesalahan saat mengambil acara: {{ eventError.message }}</p>
    </div>
    <ul v-else-if="myEvents.length" class="space-y-4">
      <li
        v-for="event in myEvents"
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
            <span
              :class="{
                'bg-green-100 text-green-800': event.verified_at,
                'bg-yellow-100 text-yellow-800': !event.verified_at,
              }"
              class="inline-block px-2 py-1 rounded-full text-xs font-semibold mt-2"
            >
              {{ event.verified_at ? "Terverifikasi" : "Belum Terverifikasi" }}
            </span>
          </div>
          <div class="flex space-x-2">
            <button
              @click="openEditModal(event)"
              :disabled="event.verified_at"
              class="bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1 px-3 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Edit
            </button>
            <button
              @click="confirmDelete(event.id)"
              :disabled="event.verified_at"
              class="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hapus
            </button>
          </div>
        </div>
      </li>
    </ul>
    <p v-else class="text-gray-500 text-center py-8">
      Anda belum membuat acara apa pun.
    </p>

    <button @click="logout" class="logout-button mt-8">Logout</button>

    <div
      v-if="showModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl"
      >
        <h3 class="text-2xl font-bold text-gray-800 mb-6">
          {{ isEditMode ? "Edit Acara" : "Buat Acara Baru" }}
        </h3>
        <form @submit.prevent="submitEvent">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                for="nama_acara"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Nama Acara <span class="text-red-500">*</span></label
              >
              <input
                type="text"
                id="nama_acara"
                v-model="eventForm.nama_acara"
                class="input-field"
                :class="{ 'border-red-500': validationErrors.nama_acara }"
              />
              <p
                v-if="validationErrors.nama_acara"
                class="text-red-500 text-xs italic"
              >
                {{ validationErrors.nama_acara }}
              </p>
            </div>
            <div>
              <label
                for="penyelenggara"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Penyelenggara <span class="text-red-500">*</span></label
              >
              <input
                type="text"
                id="penyelenggara"
                v-model="eventForm.penyelenggara"
                class="input-field"
                :class="{ 'border-red-500': validationErrors.penyelenggara }"
              />
              <p
                v-if="validationErrors.penyelenggara"
                class="text-red-500 text-xs italic"
              >
                {{ validationErrors.penyelenggara }}
              </p>
            </div>
            <div>
              <label
                for="jumlah_peserta"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Jumlah Peserta <span class="text-red-500">*</span></label
              >
              <input
                type="number"
                id="jumlah_peserta"
                v-model.number="eventForm.jumlah_peserta"
                class="input-field"
                :class="{ 'border-red-500': validationErrors.jumlah_peserta }"
                min="1"
              />
              <p
                v-if="validationErrors.jumlah_peserta"
                class="text-red-500 text-xs italic"
              >
                {{ validationErrors.jumlah_peserta }}
              </p>
            </div>
            <div>
              <label
                for="lokasi"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Lokasi <span class="text-red-500">*</span></label
              >
              <input
                type="text"
                id="lokasi"
                v-model="eventForm.lokasi"
                class="input-field"
                :class="{ 'border-red-500': validationErrors.lokasi }"
              />
              <p
                v-if="validationErrors.lokasi"
                class="text-red-500 text-xs italic"
              >
                {{ validationErrors.lokasi }}
              </p>
            </div>
            <div>
              <label
                for="provinsi"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Provinsi <span class="text-red-500">*</span></label
              >
              <select
                id="provinsi"
                v-model="eventForm.provinsi_id"
                @change="fetchKota"
                class="input-field"
                :class="{ 'border-red-500': validationErrors.provinsi_id }"
              >
                <option value="" disabled>Pilih Provinsi</option>
                <option
                  v-for="prov in allProvinsis"
                  :key="prov.id"
                  :value="prov.id"
                >
                  {{ prov.nama }}
                </option>
              </select>
              <p
                v-if="validationErrors.provinsi_id"
                class="text-red-500 text-xs italic"
              >
                {{ validationErrors.provinsi_id }}
              </p>
            </div>
            <div>
              <label
                for="kota"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Kota <span class="text-red-500">*</span></label
              >
              <select
                id="kota"
                v-model="eventForm.kota_id"
                class="input-field"
                :class="{ 'border-red-500': validationErrors.kota_id }"
                :disabled="!eventForm.provinsi_id || loadingKota"
              >
                <option value="" disabled>Pilih Kota</option>
                <option v-if="loadingKota" disabled>Memuat kota...</option>
                <option v-for="k in allKota" :key="k.id" :value="k.id">
                  {{ k.nama }}
                </option>
              </select>
              <p
                v-if="validationErrors.kota_id"
                class="text-red-500 text-xs italic"
              >
                {{ validationErrors.kota_id }}
              </p>
            </div>
            <div>
              <label
                for="kategori_acara"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Kategori Acara</label
              >
              <select
                id="kategori_acara"
                v-model="eventForm.kategori_acara_id"
                class="input-field"
              >
                <option value="" disabled>Pilih Kategori</option>
                <option
                  v-for="kat in allKategoriAcara"
                  :key="kat.id"
                  :value="kat.id"
                >
                  {{ kat.nama }}
                </option>
              </select>
            </div>
            <div>
              <label
                for="biaya"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Biaya</label
              >
              <input
                type="text"
                id="biaya"
                v-model="eventForm.biaya"
                class="input-field"
              />
            </div>
            <div>
              <label
                for="tanggal_mulai"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Tanggal Mulai <span class="text-red-500">*</span></label
              >
              <input
                type="date"
                id="tanggal_mulai"
                v-model="eventForm.tanggal_mulai"
                class="input-field"
                :class="{ 'border-red-500': validationErrors.tanggal_mulai }"
              />
              <p
                v-if="validationErrors.tanggal_mulai"
                class="text-red-500 text-xs italic"
              >
                {{ validationErrors.tanggal_mulai }}
              </p>
            </div>
            <div>
              <label
                for="tanggal_selesai"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Tanggal Selesai <span class="text-red-500">*</span></label
              >
              <input
                type="date"
                id="tanggal_selesai"
                v-model="eventForm.tanggal_selesai"
                class="input-field"
                :class="{ 'border-red-500': validationErrors.tanggal_selesai }"
              />
              <p
                v-if="validationErrors.tanggal_selesai"
                class="text-red-500 text-xs italic"
              >
                {{ validationErrors.tanggal_selesai }}
              </p>
            </div>
            <div>
              <label
                for="jam_mulai"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Jam Mulai</label
              >
              <input
                type="time"
                id="jam_mulai"
                v-model="eventForm.jam_mulai"
                class="input-field"
              />
            </div>
            <div>
              <label
                for="jam_selesai"
                class="block text-gray-700 text-sm font-bold mb-2"
                >Jam Selesai</label
              >
              <input
                type="time"
                id="jam_selesai"
                v-model="eventForm.jam_selesai"
                class="input-field"
              />
            </div>
          </div>
          <div class="mb-4">
            <label
              for="deskripsi"
              class="block text-gray-700 text-sm font-bold mb-2"
              >Deskripsi</label
            >
            <textarea
              id="deskripsi"
              v-model="eventForm.deskripsi"
              rows="3"
              class="input-field"
            ></textarea>
          </div>

          <h4 class="text-lg font-semibold text-gray-800 mb-3">
            Pengisi Acara
          </h4>
          <div
            v-for="(pengisi, index) in eventForm.pengisi_event"
            :key="index"
            class="flex space-x-2 mb-3"
          >
            <input
              type="text"
              v-model="pengisi.nama_pengisi"
              placeholder="Nama Pengisi"
              class="input-field w-1/2"
            />
            <input
              type="text"
              v-model="pengisi.judul_materi"
              placeholder="Judul Materi"
              class="input-field w-1/2"
            />
            <button
              @click="removePengisi(index)"
              type="button"
              class="bg-red-400 hover:bg-red-500 text-white text-sm px-3 rounded-md"
            >
              X
            </button>
          </div>
          <button
            @click="addPengisi"
            type="button"
            class="bg-blue-400 hover:bg-blue-500 text-white text-sm py-1 px-3 rounded-md mb-6"
          >
            + Tambah Pengisi
          </button>

          <p v-if="formError" class="text-red-500 text-center mb-4">
            {{ formError }}
          </p>

          <div class="flex justify-end space-x-4">
            <button
              @click="closeModal"
              type="button"
              class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="loadingCreate || loadingUpdate"
              class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ isEditMode ? "Simpan Perubahan" : "Buat Acara" }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div
      v-if="showDeleteConfirm"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div
        class="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl text-center"
      >
        <p class="text-lg font-semibold mb-4">
          Apakah Anda yakin ingin menghapus acara ini?
        </p>
        <div class="flex justify-center space-x-4">
          <button
            @click="cancelDelete"
            class="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-md"
          >
            Batal
          </button>
          <button
            @click="executeDelete"
            class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";
import { useQuery, useMutation } from "@vue/apollo-composable";
import gql from "graphql-tag";
import { ref, watch, reactive, computed } from "vue";

const authStore = useAuthStore();
const router = useRouter();

const myEvents = ref([]);
const loadingEvents = ref(true);
const eventError = ref(null);

const showModal = ref(false);
const isEditMode = ref(false);
const currentEventId = ref(null);
const eventForm = reactive({
  nama_acara: "",
  penyelenggara: "",
  jumlah_peserta: null,
  tanggal_mulai: "",
  tanggal_selesai: "",
  jam_mulai: "",
  jam_selesai: "",
  lokasi: "",
  provinsi_id: "",
  kota_id: "",
  kategori_acara_id: "",
  biaya: "",
  deskripsi: "",
  pengisi_event: [],
});
const validationErrors = reactive({});
const formError = ref("");

const allProvinsis = ref([]);
const allKota = ref([]);
const allKategoriAcara = ref([]);
const loadingKota = ref(false);

const showDeleteConfirm = ref(false);
const eventIdToDelete = ref(null);

const GET_MY_EVENTS_QUERY = gql`
  query GetEventPermissionList($pagination: PaginationInput, $user_id: String) {
    getEventPermissionList(pagination: $pagination, user_id: $user_id) {
      data {
        id
        nama_acara
        penyelenggara
        lokasi
        tanggal_mulai
        tanggal_selesai
        verified_at
        user_id
        jumlah_peserta
        jam_mulai
        jam_selesai
        provinsi_id
        kota_id
        kategori_acara_id
        biaya
        deskripsi
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

const CREATE_EVENT_PERMISSION_MUTATION = gql`
  mutation CreateEventPermission($input: EventPermissionInput!) {
    createEventPermission(input: $input) {
      id
      nama_acara
      user_id
      created_at
      verified_at
    }
  }
`;

const UPDATE_EVENT_PERMISSION_MUTATION = gql`
  mutation UpdateEventPermission($id: String!, $input: EventPermissionInput!) {
    updateEventPermission(id: $id, input: $input) {
      id
      nama_acara
      verified_at
      updated_at
    }
  }
`;

const DELETE_EVENT_PERMISSION_MUTATION = gql`
  mutation DeleteEventPermission($id: String!) {
    deleteEventPermission(id: $id)
  }
`;

const GET_PROVINSIS_QUERY = gql`
  query GetProvinsi {
    getProvinsi {
      id
      nama
    }
  }
`;

const GET_KATEGORI_ACARA_QUERY = gql`
  query GetKategoriAcara {
    getKategoriAcara {
      id
      nama
    }
  }
`;

const GET_KOTA_QUERY = gql`
  query GetKota($provinsiId: Int!) {
    getKota(provinsiId: $provinsiId) {
      id
      nama
    }
  }
`;

const {
  result: myEventsResult,
  loading: loadingMyEvents,
  error: myEventsError,
  refetch: refetchMyEvents,
} = useQuery(
  GET_MY_EVENTS_QUERY,
  () => ({
    user_id: authStore.userId,
    pagination: {
      take: 100,
      sort: "created_at",
      sortDirection: "desc",
    },
  }),
  {
    enabled: computed(() => !!authStore.userId),
  }
);

watch(myEventsResult, (newResult) => {
  if (newResult && newResult.getEventPermissionList) {
    myEvents.value = newResult.getEventPermissionList.data;
    loadingEvents.value = false;
  } else if (!loadingMyEvents.value) {
    myEvents.value = [];
    loadingEvents.value = false;
  }
});
watch(myEventsError, (err) => {
  eventError.value = err;
  loadingEvents.value = false;
});

const { result: provinsisResult } = useQuery(GET_PROVINSIS_QUERY);
watch(provinsisResult, (newResult) => {
  if (newResult && newResult.getProvinsi) {
    allProvinsis.value = newResult.getProvinsi;
  }
});

const { result: kategoriAcaraResult } = useQuery(GET_KATEGORI_ACARA_QUERY);
watch(kategoriAcaraResult, (newResult) => {
  if (newResult && newResult.getKategoriAcara) {
    allKategoriAcara.value = newResult.getKategoriAcara;
  }
});

const { mutate: createEvent, loading: loadingCreate } = useMutation(
  CREATE_EVENT_PERMISSION_MUTATION
);

const { mutate: updateEvent, loading: loadingUpdate } = useMutation(
  UPDATE_EVENT_PERMISSION_MUTATION
);
const { mutate: deleteEvent } = useMutation(DELETE_EVENT_PERMISSION_MUTATION);

const validateForm = () => {
  let isValid = true;
  Object.keys(validationErrors).forEach((key) => (validationErrors[key] = ""));

  if (!eventForm.nama_acara || eventForm.nama_acara.length < 3) {
    validationErrors.nama_acara = "Nama acara minimal 3 karakter.";
    isValid = false;
  }
  if (!eventForm.penyelenggara) {
    validationErrors.penyelenggara = "Penyelenggara tidak boleh kosong.";
    isValid = false;
  }
  if (eventForm.jumlah_peserta === null || eventForm.jumlah_peserta < 1) {
    validationErrors.jumlah_peserta = "Jumlah peserta minimal 1.";
    isValid = false;
  }
  if (!eventForm.lokasi || eventForm.lokasi.length < 10) {
    validationErrors.lokasi = "Lokasi minimal 10 karakter.";
    isValid = false;
  }
  if (!eventForm.provinsi_id) {
    validationErrors.provinsi_id = "Provinsi harus dipilih.";
    isValid = false;
  }
  if (!eventForm.kota_id) {
    validationErrors.kota_id = "Kota harus dipilih.";
    isValid = false;
  }
  if (!eventForm.tanggal_mulai) {
    validationErrors.tanggal_mulai = "Tanggal mulai tidak boleh kosong.";
    isValid = false;
  }
  if (!eventForm.tanggal_selesai) {
    validationErrors.tanggal_selesai = "Tanggal selesai tidak boleh kosong.";
    isValid = false;
  }
  if (
    eventForm.tanggal_mulai &&
    eventForm.tanggal_selesai &&
    new Date(eventForm.tanggal_selesai) < new Date(eventForm.tanggal_mulai)
  ) {
    validationErrors.tanggal_selesai =
      "Tanggal selesai harus setelah atau sama dengan tanggal mulai.";
    isValid = false;
  }
  if (
    eventForm.tanggal_mulai === eventForm.tanggal_selesai &&
    eventForm.jam_mulai &&
    eventForm.jam_selesai
  ) {
    const [startHour, startMinute] = eventForm.jam_mulai.split(":").map(Number);
    const [endHour, endMinute] = eventForm.jam_selesai.split(":").map(Number);
    if (startHour * 60 + startMinute >= endHour * 60 + endMinute) {
      validationErrors.jam_selesai =
        "Jam selesai harus setelah jam mulai jika di hari yang sama.";
      isValid = false;
    }
  }

  return isValid;
};

const fetchKota = async () => {
  allKota.value = [];
  eventForm.kota_id = "";
  if (eventForm.provinsi_id) {
    loadingKota.value = true;
    try {
      const { data } = await useQuery(GET_KOTA_QUERY, {
        provinsiId: eventForm.provinsi_id,
      }).result;
      if (data && data.getKota) {
        allKota.value = data.getKota;
      }
    } catch (e) {
      console.error("Error fetching kota:", e);
      alert("Gagal memuat daftar kota.");
    } finally {
      loadingKota.value = false;
    }
  }
};
watch(
  () => eventForm.provinsi_id,
  (newVal, oldVal) => {
    if (newVal && newVal !== oldVal && isEditMode.value) {
      fetchKota();
    }
  },
  { immediate: true }
);

const addPengisi = () => {
  eventForm.pengisi_event.push({ nama_pengisi: "", judul_materi: "" });
};
const removePengisi = (index) => {
  eventForm.pengisi_event.splice(index, 1);
};

const resetForm = () => {
  Object.assign(eventForm, {
    nama_acara: "",
    penyelenggara: "",
    jumlah_peserta: null,
    tanggal_mulai: "",
    tanggal_selesai: "",
    jam_mulai: "",
    jam_selesai: "",
    lokasi: "",
    provinsi_id: "",
    kota_id: "",
    kategori_acara_id: "",
    biaya: "",
    deskripsi: "",
    pengisi_event: [],
  });
  Object.keys(validationErrors).forEach((key) => (validationErrors[key] = ""));
  formError.value = "";
};

const openCreateModal = () => {
  resetForm();
  isEditMode.value = false;
  showModal.value = true;
};

const openEditModal = (event) => {
  resetForm();
  isEditMode.value = true;
  currentEventId.value = event.id;

  Object.assign(eventForm, {
    nama_acara: event.nama_acara,
    penyelenggara: event.penyelenggara,
    jumlah_peserta: event.jumlah_peserta,
    tanggal_mulai: event.tanggal_mulai,
    tanggal_selesai: event.tanggal_selesai,
    jam_mulai: event.jam_mulai,
    jam_selesai: event.jam_selesai,
    lokasi: event.lokasi,
    provinsi_id: event.provinsi_id,
    kota_id: event.kota_id,
    kategori_acara_id: event.kategori_acara_id,
    biaya: event.biaya,
    deskripsi: event.deskripsi,
    pengisi_event: event.pengisiEvent
      ? event.pengisiEvent.map((p) => ({
          nama_pengisi: p.nama_pengisi,
          judul_materi: p.judul_materi,
        }))
      : [],
  });

  if (eventForm.provinsi_id) {
    fetchKota().then(() => {
      if (!allKota.value.some((k) => k.id === eventForm.kota_id)) {
        eventForm.kota_id = "";
      }
    });
  }

  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const submitEvent = async () => {
  formError.value = "";
  if (!validateForm()) {
    formError.value = "Mohon perbaiki kesalahan pada formulir.";
    return;
  }

  const input = { ...eventForm };
  if (input.jumlah_peserta !== null) {
    input.jumlah_peserta = parseInt(input.jumlah_peserta);
  }
  delete input.user_id;
  delete input.verified_at;
  delete input.verified_by;
  delete input.created_at;
  delete input.updated_at;
  delete input.provinsi;
  delete input.kota;
  delete input.kategoriAcara;

  try {
    if (isEditMode.value) {
      await updateEvent({ id: currentEventId.value, input });
      alert("Acara berhasil diperbarui!");
    } else {
      await createEvent({ input });
      alert("Acara berhasil dibuat!");
    }
    closeModal();
    refetchMyEvents();
  } catch (e) {
    console.error("Error submitting event:", e);
    formError.value = `Gagal menyimpan acara: ${
      e.message || "Terjadi kesalahan."
    }`;
  }
};

const confirmDelete = (eventId) => {
  eventIdToDelete.value = eventId;
  showDeleteConfirm.value = true;
};

const cancelDelete = () => {
  eventIdToDelete.value = null;
  showDeleteConfirm.value = false;
};

const executeDelete = async () => {
  if (!eventIdToDelete.value) return;
  try {
    await deleteEvent({ id: eventIdToDelete.value });
    alert("Acara berhasil dihapus!");
    cancelDelete();
    refetchMyEvents();
  } catch (e) {
    console.error("Error deleting event:", e);
    alert(`Gagal menghapus acara: ${e.message || "Terjadi kesalahan."}`);
  }
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

.input-field {
  @apply shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50;
}

.logout-button {
  @apply px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-md transition-colors duration-200;
}
</style>
