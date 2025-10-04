import React, { useState } from 'react';
import { X, AlertCircle, Trash2 } from 'lucide-react';
import { updateMoodleInstance, deleteMoodleInstance, testMoodleConnection } from '../../api/moodle';
import { MoodleInstance } from '../../types';

interface EditInstanceModalProps {
  instance: MoodleInstance;
  onClose: () => void;
  onSuccess: () => void;
  onDelete: () => void;
}

export const EditInstanceModal: React.FC<EditInstanceModalProps> = ({ 
  instance, 
  onClose, 
  onSuccess,
  onDelete 
}) => {
  const [formData, setFormData] = useState({
    name: instance.name,
    slug: instance.slug,
    moodle_url: instance.moodle_url,
    moodle_token: instance.moodle_token || '',
    contact_email: instance.contact_email || '',
    notes: instance.notes || '',
    is_active: instance.is_active
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [testResult, setTestResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateMoodleInstance(instance.id, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Errore nell\'aggiornamento dell\'istanza');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setError('');
    setTestResult(null);

    try {
      const result = await testMoodleConnection(instance.id);
      setTestResult(result);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Test connessione fallito');
    } finally {
      setTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Sei sicuro di voler eliminare l'istanza "${instance.name}"? Questa azione è irreversibile.`)) {
      return;
    }

    setDeleting(true);
    setError('');

    try {
      await deleteMoodleInstance(instance.id);
      onDelete();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Errore nell\'eliminazione dell\'istanza');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">Modifica Istanza Moodle</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-start">
              <AlertCircle size={20} className="mr-2 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {testResult && (
            <div className="mb-4 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded">
              <p className="font-medium">✓ Connessione riuscita!</p>
              <p className="text-sm mt-1">Sito: {testResult.site_name}</p>
              <p className="text-sm">Versione: {testResult.moodle_version}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Istanza *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug *
              </label>
              <input
                type="text"
                required
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Moodle *
              </label>
              <input
                type="url"
                required
                value={formData.moodle_url}
                onChange={(e) => setFormData({ ...formData, moodle_url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token Web Service
              </label>
              <input
                type="text"
                value={formData.moodle_token}
                onChange={(e) => setFormData({ ...formData, moodle_token: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                placeholder="Lascia vuoto per non modificare"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Contatto
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Note
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Istanza attiva
              </label>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 size={18} />
              <span>{deleting ? 'Eliminazione...' : 'Elimina Istanza'}</span>
            </button>

            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || loading}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50"
              >
                {testing ? 'Test...' : 'Test Connessione'}
              </button>
              <button
                type="submit"
                disabled={loading || testing}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Salvataggio...' : 'Salva Modifiche'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annulla
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
