import { FileText, Calendar, Users, Book, FolderKanban, GraduationCap, X } from 'lucide-react';
import { noteTemplates } from '../../utils/templates';

const iconMap = {
  FileText,
  Calendar,
  Users,
  Book,
  FolderKanban,
  GraduationCap
};

export function TemplatePicker({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">选择模板</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 grid grid-cols-2 gap-3 overflow-y-auto max-h-[calc(80vh-80px)]">
          {noteTemplates.map((template) => {
            const Icon = iconMap[template.icon] || FileText;
            return (
              <button
                key={template.id}
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
                className="flex items-start gap-3 p-4 text-left rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-800 dark:text-white">{template.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{template.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
