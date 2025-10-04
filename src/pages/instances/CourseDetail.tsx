import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Users, FileText, Award, AlertCircle } from 'lucide-react';
import { getInstanceCourses, getCourseUsers } from '../../api/moodle';
import { MoodleCourse, MoodleUser } from '../../types';
import { UserDetailModal } from '../../components/moodle/UserDetailModal';

export const CourseDetail: React.FC = () => {
  const { id, courseId } = useParams<{ id: string; courseId: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<MoodleCourse | null>(null);
  const [users, setUsers] = useState<MoodleUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'report' | 'certificates'>('users');
  const [selectedUser, setSelectedUser] = useState<MoodleUser | null>(null);

  useEffect(() => {
    if (id && courseId) {
      loadCourseData();
    }
  }, [id, courseId]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      const coursesData = await getInstanceCourses(Number(id));
      const courseData = coursesData.find((c: MoodleCourse) => c.id === Number(courseId));
      setCourse(courseData || null);

      const usersData = await getCourseUsers(Number(id), Number(courseId));
      setUsers(usersData);
    } catch (err: any) {
      setError('Errore nel caricamento dei dati del corso');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return <div>Corso non trovato</div>;
  }

  return (
    <div>
      <button
        onClick={() => navigate(`/instances/${id}`)}
        className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Torna ai corsi</span>
      </button>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded flex items-center">
          <AlertCircle size={20} className="mr-2" />
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <BookOpen className="text-blue-600" size={32} />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{course.fullname}</h1>
            <p className="text-gray-500">{course.shortname}</p>
            <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
              <span>Inizio: {new Date(course.startdate * 1000).toLocaleDateString('it-IT')}</span>
              <span>•</span>
              <span>Fine: {new Date(course.enddate * 1000).toLocaleDateString('it-IT')}</span>
              <span>•</span>
              <span className={course.visible ? 'text-green-600' : 'text-gray-500'}>
                {course.visible ? 'Visibile' : 'Nascosto'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users size={18} />
                <span>Iscritti ({users.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'report'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText size={18} />
                <span>Report Custom</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('certificates')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'certificates'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Award size={18} />
                <span>Certificati</span>
              </div>
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Iscritti al corso</h3>
              {users.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nessun iscritto</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Azioni</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstname} {user.lastname}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{user.username}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Dettagli
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'report' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Report Configurabile</h3>
              <p className="text-gray-500">Report custom in sviluppo...</p>
            </div>
          )}

          {activeTab === 'certificates' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Certificati Emessi</h3>
              <p className="text-gray-500">Certificati in sviluppo...</p>
            </div>
          )}
        </div>
      </div>

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          instanceId={Number(id)}
          courseId={Number(courseId)}
          onClose={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
};
