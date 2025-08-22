'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, BookOpen, Languages } from 'lucide-react';

export default function GrammarGuide() {
  const [activeTopic, setActiveTopic] = useState<string | null>('tenses');
  const [language, setLanguage] = useState<'english' | 'gujarati'>('english');

  const toggleTopic = (topic: string) => {
    setActiveTopic(activeTopic === topic ? null : topic);
  };

  const grammarTopics = [
    {
      id: 'tenses',
      title: {
        english: 'Tenses',
        gujarati: 'કાળ (Tenses)'
      },
      content: {
        english: [
          {
            subtitle: 'Simple Present Tense',
            syntax: 'Subject + V1(s/es) + Object',
            example: 'Smit plays cricket.',
            usage: 'Used for habits, universal truths, and fixed arrangements.'
          },
          {
            subtitle: 'Present Continuous Tense',
            syntax: 'Subject + is/am/are + V1 + ing + Object',
            example: 'Smit is playing cricket.',
            usage: 'Used for actions happening at the moment of speaking.'
          },
          {
            subtitle: 'Present Perfect Tense',
            syntax: 'Subject + has/have + V3 + Object',
            example: 'Smit has played cricket.',
            usage: 'Used for actions completed in the recent past with present relevance.'
          },
          {
            subtitle: 'Present Perfect Continuous Tense',
            syntax: 'Subject + has/have been + V1 + ing + Object',
            example: 'Smit has been playing cricket for two hours.',
            usage: 'Used for actions that started in the past and are still continuing.'
          },
          {
            subtitle: 'Simple Past Tense',
            syntax: 'Subject + V2 + Object',
            example: 'Smit played cricket.',
            usage: 'Used for actions completed in the past.'
          },
          {
            subtitle: 'Past Continuous Tense',
            syntax: 'Subject + was/were + V1 + ing + Object',
            example: 'Smit was playing cricket.',
            usage: 'Used for actions that were in progress at a specific time in the past.'
          },
          {
            subtitle: 'Past Perfect Tense',
            syntax: 'Subject + had + V3 + Object',
            example: 'Smit had played cricket before it rained.',
            usage: 'Used for actions that were completed before another action in the past.'
          },
          {
            subtitle: 'Past Perfect Continuous Tense',
            syntax: 'Subject + had been + V1 + ing + Object',
            example: 'Smit had been playing cricket for two hours when it started raining.',
            usage: 'Used for actions that were ongoing in the past before another action interrupted.'
          },
          {
            subtitle: 'Simple Future Tense',
            syntax: 'Subject + will/shall + V1 + Object',
            example: 'Smit will play cricket tomorrow.',
            usage: 'Used for actions that will happen in the future.'
          },
          {
            subtitle: 'Future Continuous Tense',
            syntax: 'Subject + will be + V1 + ing + Object',
            example: 'Smit will be playing cricket at this time tomorrow.',
            usage: 'Used for actions that will be in progress at a specific time in the future.'
          },
          {
            subtitle: 'Future Perfect Tense',
            syntax: 'Subject + will have + V3 + Object',
            example: 'Smit will have played cricket by 5 PM.',
            usage: 'Used for actions that will be completed by a certain time in the future.'
          },
          {
            subtitle: 'Future Perfect Continuous Tense',
            syntax: 'Subject + will have been + V1 + ing + Object',
            example: 'Smit will have been playing cricket for two hours by 5 PM.',
            usage: 'Used for actions that will have been ongoing for a duration by a certain time in the future.'
          }
        ],
        gujarati: [
          {
            subtitle: 'સાદો વર્તમાન કાળ (Simple Present Tense)',
            syntax: 'કર્તા + ક્રિયાપદ (સ/એસ) + કર્મ',
            example: 'સ્મિત ક્રિકેટ રમે છે. (Smit plays cricket.)',
            usage: 'ટેવો, સાર્વત્રિક સત્યો અને નિશ્ચિત વ્યવસ્થાઓ માટે વપરાય છે.'
          },
          {
            subtitle: 'ચાલુ વર્તમાન કાળ (Present Continuous Tense)',
            syntax: 'કર્તા + છે/છું/છો + ક્રિયાપદ + ઉં + કર્મ',
            example: 'સ્મિત ક્રિકેટ રમી રહ્યો છે. (Smit is playing cricket.)',
            usage: 'બોલવાની ક્ષણે થઈ રહેલી ક્રિયાઓ માટે વપરાય છે.'
          }
        ]
      }
    },
    {
      id: 'activePassive',
      title: {
        english: 'Active and Passive Voice',
        gujarati: 'કર્તરિ અને કર્મણિ પ્રયોગ (Active and Passive Voice)'
      },
      content: {
        english: [
          {
            subtitle: 'Present Simple',
            syntax: 'Active: Subject + V1(s/es) + Object\nPassive: Object + is/am/are + V3 + by + Subject',
            example: 'Active: She writes a letter.\nPassive: A letter is written by her.',
            usage: 'Used when the focus is on the action rather than who performed it.'
          },
          {
            subtitle: 'Past Simple',
            syntax: 'Active: Subject + V2 + Object\nPassive: Object + was/were + V3 + by + Subject',
            example: 'Active: She wrote a letter.\nPassive: A letter was written by her.',
            usage: 'Used for completed actions in the past where the doer is unknown or unimportant.'
          }
        ],
        gujarati: [
          {
            subtitle: 'વર્તમાન સાદો કાળ',
            syntax: 'કર્તરિ: કર્તા + ક્રિયાપદ + કર્મ\nકર્મણિ: કર્મ + ક્રિયાપદ (અનુકૂળ રૂપ) + કર્તા',
            example: 'કર્તરિ: તે પત્ર લખે છે.\nકર્મણિ: પત્ર લખાય છે તેના દ્વારા.',
            usage: 'જ્યાં ક્રિયા પર ભાર હોય અને કર્તા પર નહીં ત્યાં વપરાય છે.'
          }
        ]
      }
    },
    {
      id: 'partsOfSpeech',
      title: {
        english: 'Parts of Speech',
        gujarati: 'ભાષાના ભાગ (Parts of Speech)'
      },
      content: {
        english: [
          {
            subtitle: 'Nouns',
            syntax: 'Naming words for people, places, things, or ideas',
            example: 'teacher, city, book, happiness',
            usage: 'Used as subjects, objects, or complements in sentences.'
          },
          {
            subtitle: 'Verbs',
            syntax: 'Words that express action or state of being',
            example: 'run, is, think, become',
            usage: 'Essential for creating predicates in sentences.'
          }
        ],
        gujarati: [
          {
            subtitle: 'નામ (Nouns)',
            syntax: 'વ્યક્તિ, સ્થાન, વસ્તુ અથવા વિચારને નામ આપતા શબ્દો',
            example: 'શિક્ષક, શહેર, પુસ્તક, સુખ',
            usage: 'વાક્યમાં કર્તા, કર્મ અથવા પૂરક તરીકે વપરાય છે.'
          }
        ]
      }
    },
    {
      id: 'pteTips',
      title: {
        english: 'PTE Grammar Tips',
        gujarati: 'PTE વ્યાકરણ ટીપ્સ (PTE Grammar Tips)'
      },
      content: {
        english: [
          {
            subtitle: 'Read Aloud',
            syntax: 'Focus on: Pronunciation, Fluency, Content',
            example: 'Practice with news articles and academic texts',
            usage: 'Speak clearly at a natural pace, emphasizing key words.'
          },
          {
            subtitle: 'Repeat Sentence',
            syntax: 'Focus on: Memory, Pronunciation, Fluency',
            example: 'Repeat exactly what you hear with the same stress and intonation',
            usage: 'Try to capture the entire sentence, not just keywords.'
          },
          {
            subtitle: 'Describe Image',
            syntax: 'Introduction → Key features → Conclusion',
            example: 'Start with "This image shows..." and highlight trends',
            usage: 'Use appropriate vocabulary for graphs, charts, and pictures.'
          },
          {
            subtitle: 'Essay Writing',
            syntax: 'Introduction → Body paragraphs → Conclusion',
            example: 'Use academic vocabulary and complex sentence structures',
            usage: 'Plan your essay structure before you start writing.'
          }
        ],
        gujarati: [
          {
            subtitle: 'જોરથી વાંચો (Read Aloud)',
            syntax: 'ધ્યાન કેન્દ્રિત કરો: ઉચ્ચાર, સરળતા, સામગ્રી',
            example: 'સમાચાર લેખો અને શૈક્ષણિક ગ્રંથો સાથે અભ્યાસ કરો',
            usage: 'કુચકિયા શબ્દો પર ભાર આપતા, કુદરતી ગતિથી સ્પષ્ટ બોલો.'
          }
        ]
      }
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Languages className="h-8 w-8 mr-3" />
              <h1 className="text-2xl font-bold">
                {language === 'english' ? 'Grammar Guide' : 'વ્યાકરણ માર્ગદર્શિકા (Grammar Guide)'}
              </h1>
            </div>
            <Button
              onClick={() => setLanguage(language === 'english' ? 'gujarati' : 'english')}
              variant="secondary"
              className="bg-white text-indigo-600 hover:bg-indigo-100"
            >
              {language === 'english' ? 'ગુજરાતી (Gujarati)' : 'English'}
            </Button>
          </div>
          <p className="mt-2">
            {language === 'english' 
              ? 'Comprehensive grammar reference for PTE exam preparation' 
              : 'PTE પરીક્ષાની તૈયારી માટે વ્યાપક વ્યાકરણ સંદર્ભ'}
          </p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {language === 'english' ? 'Grammar Topics' : 'વ્યાકરણ વિષયો (Grammar Topics)'}
            </h2>
            
            <div className="space-y-4">
              {grammarTopics.map((topic) => (
                <div key={topic.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleTopic(topic.id)}
                    className="w-full p-4 bg-gray-100 hover:bg-gray-200 flex justify-between items-center text-left"
                  >
                    <span className="font-medium">{topic.title[language]}</span>
                    {activeTopic === topic.id ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </button>
                  
                  {activeTopic === topic.id && (
                    <div className="p-4 bg-white border-t">
                      <div className="space-y-6">
                        {topic.content[language].map((item, index) => (
                          <div key={index} className="pb-4 border-b last:border-b-0 last:pb-0">
                            <h3 className="font-semibold text-lg text-indigo-700 mb-2">
                              {item.subtitle}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-blue-50 p-3 rounded">
                                <h4 className="font-medium text-blue-800">
                                  {language === 'english' ? 'Syntax/Structure' : 'રચના (Syntax/Structure)'}
                                </h4>
                                <p className="mt-1 whitespace-pre-line">{item.syntax}</p>
                              </div>
                              <div className="bg-green-50 p-3 rounded">
                                <h4 className="font-medium text-green-800">
                                  {language === 'english' ? 'Example' : 'ઉદાહરણ (Example)'}
                                </h4>
                                <p className="mt-1">{item.example}</p>
                              </div>
                              <div className="bg-purple-50 p-3 rounded">
                                <h4 className="font-medium text-purple-800">
                                  {language === 'english' ? 'Usage' : 'ઉપયોગ (Usage)'}
                                </h4>
                                <p className="mt-1">{item.usage}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Additional PTE Tips Section */}
          <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-yellow-600" />
              {language === 'english' 
                ? 'General PTE Grammar Tips' 
                : 'સામાન્ય PTE વ્યાકરણ ટીપ્સ (General PTE Grammar Tips)'}
            </h2>
            
            <ul className="list-disc pl-5 space-y-2">
              {language === 'english' ? (
                <>
                  <li>Always check subject-verb agreement in your responses</li>
                  <li>Use appropriate tenses based on the context</li>
                  <li>Practice articles (a, an, the) as they're commonly tested</li>
                  <li>Learn common preposition combinations (depend on, interested in, etc.)</li>
                  <li>Use complex sentence structures to demonstrate language proficiency</li>
                  <li>Proofread your written responses for grammatical errors</li>
                </>
              ) : (
                <>
                  <li>તમારા જવાબોમાં કર્તા-ક્રિયા સહમતિ હમેશા તપાસો</li>
                  <li>સંદર્ભના આધારે યોગ્ય કાળનો ઉપયોગ કરો</li>
                  <li>આર્ટિકલ્સ (a, an, the) નો અભ્યાસ કરો કારણ કે તે સામાન્ય રીતે પરીક્ષામાં આવે છે</li>
                  <li>સામાન્ય પૂર્વનામ સંયોજનો શીખો (depend on, interested in, વગેરે)</li>
                  <li>ભાષા નિપુણતા દર્શાવવા માટે જટિલ વાક્ય રચનાઓનો ઉપયોગ કરો</li>
                  <li>વ્યાકરણની ભૂલો માટે તમારા લેખિત જવાબોની પ્રૂફરીડિંગ કરો</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}