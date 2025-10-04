import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Server, AlertCircle } from 'lucide-react';
import { getMoodleInstances } from '../../api/moodle';
import { MoodleInstance } from '../../types';
import { CreateInstanceModal } from '../../components/moodle/CreateInstanceModal';

export const InstancesList: React.FC = () => {
  const navigate = useNavigate();
  const [instances, setInstances] = useState<MoodleInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadInstances();
  }, []);

  const loadInstances = async () => {
    try {
      setLoading(true);
      const data = await getMoodleInstances(true); // Solo attive
      setInstances(data);
    } catch (err: any) {
      setError('Errore nel caricamento delle istanze');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    loadInstances();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Istanze Moodle</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Nuova Istanza</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instances.map((instance) => (
          <div
            key={instance.id}
            onClick={() => navigate(`/instances/${instance.id}`)}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Server className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{instance.name}</h3>
                  <p className="text-sm text-gray-500">{instance.slug}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600 truncate">
                <span className="font-medium">URL:</span> {instance.moodle_url}
              </p>
              {instance.contact_email && (
                <p className="text-sm text-gray-600 truncate">
                  <span className="font-medium">Contatto:</span> {instance.contact_email}
                </p>
              )}
              {instance.last_sync_at && (
                <p className="text-xs text-gray-500">
                  Ultimo sync: {new Date(instance.last_sync_at).toLocaleString('it-IT')}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {instances.length === 0 && !loading && (
        <div className="text-center py-12">
          <Server size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nessuna istanza</h3>
          <p className="text-gray-500 mb-4">Inizia aggiungendo la tua prima istanza Moodle</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            <span>Aggiungi Istanza</span>
          </button>
        </div>
      )}

      {showCreateModal && (
        <CreateInstanceModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}
    </div>
  );
};
