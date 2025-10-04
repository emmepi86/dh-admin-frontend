import React, { useState, useEffect } from 'react';
import { X, CheckCircle, TrendingUp, User, MapPin, Briefcase, FileText, Circle, Award } from 'lucide-react';
import { getUserCompletion, getUserGrades, getUserActivitiesCompletion, getCourseContents } from '../../api/moodle';
import { MoodleUser } from '../../types';

interface UserDetailModalProps {
  user: MoodleUser;
  instanceId: number;
  courseId: number;
  onClose: () => void;
}

interface Activity {
  cmid: number;
  modname: string;
  name: string;
  state: number;
  timecompleted: number;
  details?: any[];
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  instanceId,
  courseId,
  onClose,
}) => {
  const [completion, setCompletion] = useState<any>(null);
  const [grades, setGrades] = useState<any[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'anagrafica' | 'completamento' | 'voti'>('anagrafica');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const [completionData, gradesData, activitiesData, contentsData] = await Promise.all([
        getUserCompletion(instanceId, courseId, user.id),
        getUserGrades(instanceId, courseId, user.id),
        getUserActivitiesCompletion(instanceId, courseId, user.id),
        getCourseContents(instanceId, courseId),
      ]);
      
      setCompletion(completionData);
      setGrades(gradesData);

      const activitiesMap = new Map();
      contentsData.forEach((section: any) => {
        section.modules?.forEach((module: any) => {
          activitiesMap.set(module.id, module.name);
        });
      });

      const enrichedActivities = activitiesData.map((activity: any) => ({
        ...activity,
        name: activitiesMap.get(activity.cmid) || activity.modname,
      }));

      setActivities(enrichedActivities);
    } catch (err) {
      console.error('Errore caricamento dati utente:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCustomField = (shortname: string) => {
    const field = (user as any).customfields?.find((f: any) => f.shortname === shortname);
    return field?.value || '-';
  };

  const formatDate = (timestamp: string) => {
    if (!timestamp || timestamp === '-') return '-';
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString('it-IT');
  };

  const getCompletionIcon = (state: number) => {
    return state === 1 
      ? <CheckCircle className="text-green-600" size={20} />
      : <Circle className="text-gray-400" size={20} />;
  };

  const getModuleTypeLabel = (modname: string) => {
    const types: { [key: string]: string } = {
      'page': 'Pagina',
      'quiz': 'Quiz',
      'scorm': 'SCORM',
      'forum': 'Forum',
      'assign': 'Compito',
      'resource': 'Risorsa',
      'url': 'URL',
      'label': 'Etichetta',
    };
    return types[modname] || modname;
  };

  const getGradeStatus = (grade: any) => {
    if (grade.graderaw !== null && grade.graderaw !== undefined) {
      return 'graded';
    }
    if (grade.status === 'novalue') {
      return 'novalue';
    }
    return 'pending';
  };

  const getGradeColor = (grade: any) => {
    const status = getGradeStatus(grade);
    if (status === 'graded') {
      const percentage = (grade.graderaw / grade.grademax) * 100;
      if (percentage >= 60) return 'bg-green-50 border-green-200';
      if (percentage >= 40) return 'bg-yellow-50 border-yellow-200';
      return 'bg-red-50 border-red-200';
    }
    return 'bg-gray-50 border-gray-200';
  };

  const courseGrade = grades.find(g => g.itemtype === 'course');
  const itemGrades = grades.filter(g => g.itemtype !== 'course');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-blue-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user.firstname.charAt(0)}{user.lastname.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {user.firstname} {user.lastname}
              </h2>
              <p className="text-sm text-gray-600">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('anagrafica')}
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'anagrafica'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <User size={16} />
                <span>Anagrafica</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('completamento')}
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'completamento'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText size={16} />
                <span>Materiali ({activities.length})</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('voti')}
              className={`py-3 px-4 border-b-2 font-medium text-sm ${
                activeTab === 'voti'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp size={16} />
                <span>Valutazioni</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'anagrafica' && (
            <div className="space-y-6">
              {/* Dati Personali */}
              <div>
                <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-4">
                  <User size={20} className="text-blue-600" />
                  <span>Dati Personali</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Codice Fiscale</label>
                    <p className="text-gray-900">{getCustomField('codice_fiscale')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Sesso</label>
                    <p className="text-gray-900">{getCustomField('sesso')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data di Nascita</label>
                    <p className="text-gray-900">{formatDate(getCustomField('data_nascita'))}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Luogo di Nascita</label>
                    <p className="text-gray-900">
                      {getCustomField('comune_nascita')}, {getCustomField('provincia_nascita')} ({getCustomField('regione_nascita')})
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefono</label>
                    <p className="text-gray-900">{getCustomField('telefono')}</p>
                  </div>
                </div>
              </div>

              {/* Indirizzo */}
              <div>
                <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-4">
                  <MapPin size={20} className="text-blue-600" />
                  <span>Residenza</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Indirizzo</label>
                    <p className="text-gray-900">{getCustomField('indirizzo_via')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Città</label>
                    <p className="text-gray-900">{getCustomField('indirizzo_citta')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Provincia</label>
                    <p className="text-gray-900">{getCustomField('indirizzo_provincia')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">CAP</label>
                    <p className="text-gray-900">{getCustomField('indirizzo_cap')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Stato</label>
                    <p className="text-gray-900">{getCustomField('indirizzo_stato')}</p>
                  </div>
                </div>
              </div>

              {/* Dati Professionali */}
              <div>
                <h3 className="flex items-center space-x-2 text-lg font-semibold text-gray-900 mb-4">
                  <Briefcase size={20} className="text-blue-600" />
                  <span>Dati Professionali</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Professione</label>
                    <p className="text-gray-900">{getCustomField('profession')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Disciplina</label>
                    <p className="text-gray-900">{getCustomField('discipline')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo Rapporto</label>
                    <p className="text-gray-900">{getCustomField('tipo_rapporto')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Iscritto Albo</label>
                    <p className="text-gray-900">{getCustomField('iscritto_albo')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Regione Albo</label>
                    <p className="text-gray-900">{getCustomField('regione_albo')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Ente di Riferimento</label>
                    <p className="text-gray-900">{getCustomField('istituto_riferimento')}</p>
                  </div>
                </div>
              </div>

              {/* UUID */}
              <div className="pt-4 border-t">
                <label className="text-sm font-medium text-gray-500">Person UUID</label>
                <p className="text-xs text-gray-600 font-mono">{getCustomField('person_id')}</p>
              </div>
            </div>
          )}

          {activeTab === 'completamento' && (
            <div>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Stato Generale */}
                  <div className="bg-blue-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Stato Corso</span>
                      <span className={`px-3 py-1 text-sm rounded-full ${
                        completion?.completed 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {completion?.completed ? 'Completato' : 'In corso'}
                      </span>
                    </div>
                    {completion?.timecompleted && (
                      <p className="text-sm text-gray-600 mt-2">
                        Completato il: {new Date(completion.timecompleted * 1000).toLocaleString('it-IT')}
                      </p>
                    )}
                  </div>

                  {/* Lista Attività/Materiali */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Materiali e Attività</h3>
                  {activities.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nessuna attività con tracciamento completamento</p>
                  ) : (
                    <div className="space-y-2">
                      {activities.map((activity, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {getCompletionIcon(activity.state)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {activity.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {getModuleTypeLabel(activity.modname)}
                                </p>
                              </div>
                              <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                                activity.state === 1 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {activity.state === 1 ? 'Completato' : 'Da completare'}
                              </span>
                            </div>
                            {activity.timecompleted > 0 && (
                              <p className="text-xs text-gray-500 mt-2">
                                Completato: {new Date(activity.timecompleted * 1000).toLocaleString('it-IT')}
                              </p>
                            )}
                            {activity.details && activity.details.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {activity.details.map((detail: any, idx: number) => (
                                  <div key={idx} className="flex items-center space-x-2 text-xs">
                                    {detail.rulevalue.status === 1 ? (
                                      <CheckCircle size={12} className="text-green-600" />
                                    ) : (
                                      <Circle size={12} className="text-gray-400" />
                                    )}
                                    <span className="text-gray-600">{detail.rulevalue.description}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'voti' && (
            <div>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Voto Finale Corso */}
                  {courseGrade && (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Award className="text-blue-600" size={24} />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Voto Finale Corso</p>
                            <p className="text-xs text-gray-400">Range: {courseGrade.grademin}–{courseGrade.grademax}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {courseGrade.graderaw !== null ? (
                            <div>
                              <p className="text-3xl font-bold text-blue-600">
                                {courseGrade.graderaw}
                              </p>
                              <p className="text-sm text-gray-600">su {courseGrade.grademax}</p>
                            </div>
                          ) : (
                            <span className="text-xl text-gray-400">Non valutato</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Valutazioni Singole Attività */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Valutazioni Attività</h3>
                  {itemGrades.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">Nessuna attività valutabile</p>
                  ) : (
                    <div className="space-y-3">
                      {itemGrades.map((grade, index) => (
                        <div
                          key={index}
                          className={`rounded-lg p-4 border-2 transition-colors ${getGradeColor(grade)}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <p className="font-medium text-gray-900">
                                  {grade.itemname || 'Attività'}
                                </p>
                                <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-100 rounded">
                                  {getModuleTypeLabel(grade.itemmodule)}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Range: {grade.grademin}–{grade.grademax}
                              </p>
                              {grade.feedback && (
                                <p className="text-sm text-gray-600 mt-2 italic">
                                  {grade.feedback}
                                </p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              {grade.graderaw !== null && grade.graderaw !== undefined ? (
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">
                                    {grade.graderaw}
                                  </p>
                                  <p className="text-sm text-gray-600">/ {grade.grademax}</p>
                                  {grade.percentageformatted && grade.percentageformatted !== '-' && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      ({grade.percentageformatted})
                                    </p>
                                  )}
                                </div>
                              ) : (
                                <div>
                                  <p className="text-lg text-gray-400">N/A</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {grade.status === 'novalue' ? 'Non valutato' : 'In attesa'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
