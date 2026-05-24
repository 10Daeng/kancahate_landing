-- Migration: Create incident_reports table
-- Standardized school bullying/violence reporting format
-- Covers: Reporter identity, perpetrator info, victim info, incident details,
-- chronology (5W1H), witnesses, evidence, initial actions, values violated
-- (Budaya Sekolah Aman Nyaman, 7 Kebiasaan Baik Anak Indonesia, Nilai SOBAT)

CREATE TABLE IF NOT EXISTS incident_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- 1. Identitas Pelapor
  reporter_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reporter_name TEXT,
  reporter_status TEXT CHECK (reporter_status IN ('siswa', 'orang_tua', 'guru', 'saksi', 'lainnya')),
  reporter_phone TEXT,
  reporter_email TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,

  -- 2. Informasi Terlapor (Pelaku)
  perp_name TEXT,
  perp_class TEXT,
  perp_description TEXT,

  -- 3. Informasi Korban
  victim_name TEXT,
  victim_class TEXT,
  victim_relation TEXT,

  -- 4. Detail Kejadian
  incident_type TEXT NOT NULL,
  bullying_types JSONB DEFAULT '[]',
  location TEXT,
  incident_date TIMESTAMP,
  incident_time TEXT,

  -- 5. Kronologi Kejadian (5W1H)
  chronology TEXT NOT NULL,

  -- 6. Saksi
  witnesses JSONB DEFAULT '[]',

  -- 7. Bukti Pendukung
  evidence JSONB DEFAULT '[]',

  -- 8. Tindakan Awal
  initial_actions TEXT,
  reported_to_counselor BOOLEAN DEFAULT FALSE,

  -- Nilai-nilai yang dilanggar
  values_violated JSONB DEFAULT '[]',

  -- Severity & Status
  severity TEXT DEFAULT 'sedang' CHECK (severity IN ('rendah', 'sedang', 'tinggi')),
  status TEXT DEFAULT 'baru' CHECK (status IN ('baru', 'ditinjau', 'ditindaklanjuti', 'selesai')),
  admin_notes TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_incident_reports_status ON incident_reports(status);
CREATE INDEX IF NOT EXISTS idx_incident_reports_type ON incident_reports(incident_type);
CREATE INDEX IF NOT EXISTS idx_incident_reports_reporter ON incident_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_incident_reports_created ON incident_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_reports_severity ON incident_reports(severity);

-- Comments
COMMENT ON TABLE incident_reports IS 'Laporan kejadian perundungan/kekerasan/intoleransi di sekolah';
COMMENT ON COLUMN incident_reports.incident_type IS 'Jenis insiden: kekerasan_fisik, kekerasan_verbal, bullying_fisik, bullying_verbal, bullying_psikologis, bullying_siber, intoleransi';
COMMENT ON COLUMN incident_reports.bullying_types IS 'Sub-jenis bullying: fisik, verbal, psikologis/sosial, siber';
COMMENT ON COLUMN incident_reports.witnesses IS 'Array saksi [{name, class, role}]';
COMMENT ON COLUMN incident_reports.evidence IS 'Array bukti [{type, description}] type: foto, video, screenshot, rekaman_suara, visum, barang_rusak';
COMMENT ON COLUMN incident_reports.values_violated IS 'Nilai-nilai yang dilanggar: budaya_sekolah_aman, kebiasaan_baik_indonesia, nilai_sobat';
COMMENT ON COLUMN incident_reports.severity IS 'Tingkat keparahan: rendah, sedang, tinggi';
COMMENT ON COLUMN incident_reports.status IS 'Status laporan: baru, ditinjau, ditindaklanjuti, selesai';