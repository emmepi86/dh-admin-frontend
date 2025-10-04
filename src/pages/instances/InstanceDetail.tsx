import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Server, RefreshCw, AlertCircle, Settings } from 'lucide-react';
import { getMoodleInstance, getInstanceCourses } from '../../api/moodle';
import { MoodleInstance, MoodleCourse } from '../../types';
import { EditInstanceModal } from '../../components/moodle/EditInstanceModal';

export const InstanceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [instance, setInstance] = useState<MoodleInstance | null>(null);
  const [courses, setCourses] = useState<MoodleCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadInstanceData();
    }
  }, [id]);

  const loadInstanceData = async () => {
    try {
      setLoading(true);
      const instanceData = await getMoodleInstance(Number(id));
      setInstance(instanceData);

      const coursesData = await getInstanceCourses(Number(id));
      // Filtra corso ID 1 (homepage Moodle)
      const filteredCourses = coursesData.filter((course: MoodleCourse) => course.id !== 1);
      setCourses(filteredCourses);
    } catch (err: any) {
      setError('Errore nel caricamento dei dati');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSuccess = () => {
    navigate('/'); // Torna alla lista dopo eliminazione
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!instance) {
    return <div>Istanza non trovata</div>;
  }

  return (
    <div>
      <button
        onClick={() => navigate('/')}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Torna alle istanze</span>
      </button>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}

      {/* Instance Info */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Server className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{instance.name}</h1>
              <p className="text-gray-500">{instance.slug}</p>
            </div>
          </div>
          <button
            onClick={loadInstanceData}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Ricarica dati"
          >
            <RefreshCw size={20} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">URL Moodle</p>
            <p className="text-gray-900">{instance.moodle_url}</p>
          </div>
          {instance.contact_email && (
            <div>
              <p className="text-sm font-medium text-gray-500">Email Contatto</p>
              <p className="text-gray-900">{instance.contact_email}</p>
            </div>
          )}
          {instance.notes && (
            <div className="md:col-span-2">
              <p className="text-sm font-medium text-gray-500">Note</p>
              <p className="text-gray-900">{instance.notes}</p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <Settings size={18} />
            <span>Modifica Istanza</span>
          </button>
        </div>
      </div>

      {/* Courses List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Corsi ({courses.length})
        </h2>

        {courses.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nessun corso disponibile</p>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => navigate(`/instances/${id}/courses/${course.id}`)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{course.fullname}</h3>
                    <p className="text-sm text-gray-500">{course.shortname}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      course.visible
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {course.visible ? 'Visibile' : 'Nascosto'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <span>Inizio: {new Date(course.startdate * 1000).toLocaleDateString('it-IT')}</span>
                  <span className="mx-2">•</span>
                  <span>Fine: {new Date(course.enddate * 1000).toLocaleDateString('it-IT')}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showEditModal && instance && (
        <EditInstanceModal
          instance={instance}
          onClose={() => setShowEditModal(false)}
          onSuccess={loadInstanceData}
          onDelete={handleDeleteSuccess}
        />
      )}
    </div>
  );
};
