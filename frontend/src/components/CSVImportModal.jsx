import { useState, useRef } from 'react';
import Papa from 'papaparse';
import { HiOutlineUpload, HiOutlineX, HiOutlineCheckCircle } from 'react-icons/hi';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

export default function CSVImportModal({ isOpen, onClose, onImported }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);
  const fileRef = useRef();

  if (!isOpen) return null;

  const handleFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    Papa.parse(f, {
      header: true,
      skipEmptyLines: true,
      preview: 5,
      complete: (res) => setPreview(res.data),
    });
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res) => {
        try {
          const response = await API.post('/leads/bulk', { leads: res.data });
          setResult(response.data);
          if (response.data.imported > 0) {
            toast.success(`${response.data.imported} leads imported`);
            onImported?.();
          }
        } catch (err) {
          toast.error(err.response?.data?.detail || 'Import failed');
        } finally {
          setImporting(false);
        }
      },
    });
  };

  const handleReset = () => {
    setFile(null);
    setPreview([]);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '540px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Import Leads from CSV</h2>
          <button className="modal-close" onClick={onClose}><HiOutlineX size={20} /></button>
        </div>

        {result ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <HiOutlineCheckCircle size={48} color="var(--status-converted)" />
            <p style={{ margin: '16px 0', fontSize: '1.1rem', fontWeight: 600 }}>
              {result.imported} leads imported
            </p>
            {result.errors?.length > 0 && (
              <div style={{ textAlign: 'left', marginTop: '12px' }}>
                <p style={{ color: 'var(--status-lost)', fontWeight: 500 }}>{result.errors.length} errors:</p>
                {result.errors.map((err, i) => (
                  <p key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Row {err.row}: {err.message}
                  </p>
                ))}
              </div>
            )}
            <button className="btn btn-primary" onClick={() => { handleReset(); onClose(); }} style={{ marginTop: '20px' }}>
              Done
            </button>
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            {!file ? (
              <div
                className="csv-dropzone"
                onClick={() => fileRef.current?.click()}
              >
                <HiOutlineUpload size={32} />
                <p>Click to select a CSV file</p>
                <p className="csv-dropzone-hint">Expected columns: name, email, phone, source, status</p>
                <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} hidden />
              </div>
            ) : (
              <div>
                <p style={{ fontWeight: 600, marginBottom: '12px' }}>{file.name}</p>
                {preview.length > 0 && (
                  <div className="table-wrapper" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>{Object.keys(preview[0]).map(k => <th key={k}>{k}</th>)}</tr>
                      </thead>
                      <tbody>
                        {preview.map((row, i) => (
                          <tr key={i}>
                            {Object.values(row).map((v, j) => <td key={j}>{v || '-'}</td>)}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
                  <button className="btn btn-secondary" onClick={handleReset}>Choose different file</button>
                  <button className="btn btn-primary" onClick={handleImport} disabled={importing}>
                    {importing ? 'Importing...' : `Import ${preview.length}+ leads`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
