/**
 * EventVerse AI — database.js
 * ====================================================
 * LAYER 1: Data & Storage Layer
 * Mengelola dataset venue bawaan dan seluruh operasi
 * CRUD berbasis browser LocalStorage.
 * ====================================================
 */

'use strict';

// ─────────────────────────────────────────────────────────
// 1. DATASET VENUE BAWAAN (10 venue default, read-only)
// ─────────────────────────────────────────────────────────

const DEFAULT_VENUES = [
  // ── Yogyakarta ──
  { id: 'v001', nama: 'GSP UGM',               kota: 'Yogyakarta', kapasitas: 3500,  kategori: 'indoor'       },
  { id: 'v002', nama: 'JEC Jogja Expo Center',  kota: 'Yogyakarta', kapasitas: 8000,  kategori: 'semi-outdoor' },
  { id: 'v003', nama: 'Tebing Breksi',          kota: 'Yogyakarta', kapasitas: 2000,  kategori: 'outdoor'      },
  { id: 'v004', nama: 'Stadion Kridosono',      kota: 'Yogyakarta', kapasitas: 5000,  kategori: 'outdoor'      },
  { id: 'v005', nama: 'Auditorium Driyarkara',  kota: 'Yogyakarta', kapasitas: 1200,  kategori: 'indoor'       },
  // ── Jakarta ──
  { id: 'v006', nama: 'Istora Senayan',         kota: 'Jakarta',    kapasitas: 7000,  kategori: 'indoor'       },
  { id: 'v007', nama: 'JIExpo Kemayoran',       kota: 'Jakarta',    kapasitas: 12000, kategori: 'semi-outdoor' },
  // ── Bandung ──
  { id: 'v008', nama: 'Sabuga',                 kota: 'Bandung',    kapasitas: 2500,  kategori: 'indoor'       },
  // ── Surabaya ──
  { id: 'v009', nama: 'Grand City Hall',        kota: 'Surabaya',   kapasitas: 4000,  kategori: 'indoor'       },
  // ── Bali ──
  { id: 'v010', nama: 'GWK Cultural Park',      kota: 'Bali',       kapasitas: 10000, kategori: 'outdoor'      },
];

// ─────────────────────────────────────────────────────────
// 2. STORAGE KEYS
// ─────────────────────────────────────────────────────────

const KEY_VENUES = 'ev_venues';   // custom venues (array)
const KEY_EVENTS = 'ev_events';   // event records (array)

// ─────────────────────────────────────────────────────────
// 3. VENUE CRUD
// ─────────────────────────────────────────────────────────

/**
 * Kembalikan semua venue: 10 default + custom dari LocalStorage.
 * @returns {Array} gabungan venue default dan custom
 */
function LS_getAllVenues() {
  const raw    = localStorage.getItem(KEY_VENUES);
  const custom = raw ? JSON.parse(raw) : [];
  return [...DEFAULT_VENUES, ...custom];
}

/**
 * Simpan satu venue custom ke LocalStorage.
 * @param {{ id:string, nama:string, kota:string, kapasitas:number, kategori:string }} venue
 */
function LS_saveVenue(venue) {
  const raw    = localStorage.getItem(KEY_VENUES);
  const custom = raw ? JSON.parse(raw) : [];
  custom.push(venue);
  localStorage.setItem(KEY_VENUES, JSON.stringify(custom));
}

/**
 * Hapus venue custom berdasarkan id.
 * Venue default (v001–v010) tidak bisa dihapus.
 * @param {string} id
 */
function LS_deleteCustomVenue(id) {
  const raw     = localStorage.getItem(KEY_VENUES);
  const custom  = raw ? JSON.parse(raw) : [];
  const updated = custom.filter(v => v.id !== id);
  localStorage.setItem(KEY_VENUES, JSON.stringify(updated));
}

/**
 * Hapus SEMUA venue custom (reset ke default saja).
 */
function LS_clearCustomVenues() {
  localStorage.removeItem(KEY_VENUES);
}

// ─────────────────────────────────────────────────────────
// 4. EVENT RECORDS CRUD
// ─────────────────────────────────────────────────────────

/**
 * Kembalikan seluruh event records dari LocalStorage.
 * @returns {Array}
 */
function LS_getAllEvents() {
  const raw = localStorage.getItem(KEY_EVENTS);
  return raw ? JSON.parse(raw) : [];
}

/**
 * Simpan satu event record baru.
 * @param {{ id:string, name:string, theme:string, venue:string, city:string,
 *           date:string, capacity:number, budget:number, status:string,
 *           notes:string, savedAt:string }} event
 */
function LS_saveEvent(event) {
  const events = LS_getAllEvents();
  events.push(event);
  localStorage.setItem(KEY_EVENTS, JSON.stringify(events));
}

/**
 * Hapus satu event record berdasarkan id.
 * @param {string} id
 */
function LS_deleteEvent(id) {
  const updated = LS_getAllEvents().filter(e => e.id !== id);
  localStorage.setItem(KEY_EVENTS, JSON.stringify(updated));
}

/**
 * Update event record yang sudah ada.
 * @param {string} id  — id record yang akan diupdate
 * @param {Object} patch — field-field yang ingin diubah
 */
function LS_updateEvent(id, patch) {
  const events  = LS_getAllEvents();
  const updated = events.map(e => e.id === id ? { ...e, ...patch, updatedAt: new Date().toISOString() } : e);
  localStorage.setItem(KEY_EVENTS, JSON.stringify(updated));
}

/**
 * Hapus SEMUA event records (reset database).
 */
function LS_clearEvents() {
  localStorage.removeItem(KEY_EVENTS);
}

// ─────────────────────────────────────────────────────────
// 5. EXPORT / BACKUP & IMPORT
// ─────────────────────────────────────────────────────────

/**
 * Ekspor seluruh data (venues custom + events) sebagai JSON string.
 * Gunakan untuk backup manual.
 * @returns {string} JSON
 */
function DB_exportAll() {
  return JSON.stringify({
    exportedAt:    new Date().toISOString(),
    customVenues:  LS_getAllVenues().filter(v => v.id.startsWith('vc')),
    events:        LS_getAllEvents(),
  }, null, 2);
}

/**
 * Import data dari JSON string hasil DB_exportAll().
 * Data yang ada akan DITIMPA.
 * @param {string} jsonString
 * @returns {{ ok:boolean, message:string }}
 */
function DB_importAll(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (data.customVenues) localStorage.setItem(KEY_VENUES, JSON.stringify(data.customVenues));
    if (data.events)       localStorage.setItem(KEY_EVENTS, JSON.stringify(data.events));
    return { ok: true, message: `Import berhasil: ${data.events?.length || 0} event, ${data.customVenues?.length || 0} venue custom.` };
  } catch (err) {
    return { ok: false, message: 'Import gagal: JSON tidak valid. ' + err.message };
  }
}

// ─────────────────────────────────────────────────────────
// 6. STATISTIK RINGKAS
// ─────────────────────────────────────────────────────────

/**
 * Kembalikan statistik aggregat event records.
 * @returns {{ totalEvents:number, totalBudget:number, totalCapacity:number, byStatus:Object }}
 */
function DB_getStats() {
  const events = LS_getAllEvents();
  const byStatus = {};
  let totalBudget = 0, totalCapacity = 0;

  events.forEach(e => {
    byStatus[e.status] = (byStatus[e.status] || 0) + 1;
    totalBudget   += parseFloat(e.budget)   || 0;
    totalCapacity += parseInt(e.capacity)   || 0;
  });

  return {
    totalEvents:   events.length,
    totalBudget,
    totalCapacity,
    byStatus,
  };
}
