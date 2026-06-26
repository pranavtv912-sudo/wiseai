import React from 'react';

export const ResumePreview = ({ data, template }) => {
  // Styles based on selected template
  const isModern = template === 'Modern';
  const isMinimal = template === 'Minimal';
  
  const accentColor = isModern ? '#3baf81' : '#333333';
  const nameAlign = isModern ? 'text-center' : 'text-left';

  return (
    <div className="w-full bg-white text-black p-8 shadow-2xl overflow-y-auto" style={{ minHeight: '1056px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      
      {/* Header */}
      <div className={`mb-6 ${nameAlign}`}>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">{data.name || 'Your Name'}</h1>
        <div className="text-sm text-gray-600 flex flex-wrap justify-center gap-x-3 gap-y-1">
          {data.email && <span>{data.email}</span>}
          {data.phone && <span>• {data.phone}</span>}
          {data.linkedin && <span>• {data.linkedin}</span>}
          {data.github && <span>• {data.github}</span>}
          {data.portfolio && <span>• {data.portfolio}</span>}
        </div>
      </div>

      {!isMinimal && <hr className="border-t-2 mb-6" style={{ borderColor: accentColor }} />}

      {/* Summary */}
      {data.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-2" style={{ color: accentColor }}>Professional Summary</h2>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{data.summary}</p>
        </div>
      )}

      {/* Experience */}
      {data.experience && data.experience.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-2" style={{ color: accentColor }}>Professional Experience</h2>
          <div className="space-y-4">
            {data.experience.map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-900">
                    {exp.role && `${exp.role} `}
                    {exp.role && exp.company && 'at '}
                    {exp.company && <span className="font-semibold">{exp.company}</span>}
                  </h3>
                  <span className="text-sm text-gray-500 italic whitespace-nowrap ml-4">{exp.duration}</span>
                </div>
                {exp.description && (
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {data.projects && data.projects.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-2" style={{ color: accentColor }}>Projects</h2>
          <div className="space-y-4">
            {data.projects.map((proj, idx) => (
              <div key={idx}>
                <h3 className="font-bold text-gray-900 mb-1">{proj.name}</h3>
                {proj.description && (
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{proj.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education && data.education.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-2" style={{ color: accentColor }}>Education</h2>
          <div className="space-y-2">
            {data.education.map((edu, idx) => (
              <div key={idx} className="flex justify-between items-baseline">
                <div>
                  <span className="font-bold text-gray-900">{edu.institution}</span>
                  {edu.degree && <span className="text-gray-800"> - {edu.degree}</span>}
                </div>
                <span className="text-sm text-gray-500 italic whitespace-nowrap ml-4">{edu.year}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills && data.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-2" style={{ color: accentColor }}>Skills</h2>
          <p className="text-sm text-gray-800 leading-relaxed">
            {data.skills.join(', ')}
          </p>
        </div>
      )}

      {/* Certifications */}
      {data.certifications && data.certifications.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase mb-2" style={{ color: accentColor }}>Certifications</h2>
          <p className="text-sm text-gray-800 leading-relaxed">
            {data.certifications.join(', ')}
          </p>
        </div>
      )}
    </div>
  );
};
