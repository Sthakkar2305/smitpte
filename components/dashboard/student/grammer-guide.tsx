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
          },
          {
            subtitle: 'પૂર્ણ વર્તમાન કાળ (Present Perfect Tense)',
            syntax: 'કર્તા + ચૂક્યો/ચૂકી/ચૂક્યા + ક્રિયાપદ + કર્મ',
            example: 'સ્મિત ક્રિકેટ રમી ચૂક્યો છે. (Smit has played cricket.)',
            usage: 'તાજેતરના ભૂતકાળમાં પૂર્ણ થયેલી ક્રિયાઓ માટે વપરાય છે જે વર્તમાન સંબંધ ધરાવે છે.'
          },
          {
            subtitle: 'પૂર્ણ ચાલુ વર્તમાન કાળ (Present Perfect Continuous Tense)',
            syntax: 'કર્તા + ચૂક્યો/ચૂકી/ચૂક્યા + હતો/હતી/હતા + ક્રિયાપદ + ઉં + કર્મ',
            example: 'સ્મિત બે કલાકથી ક્રિકેટ રમી રહ્યો છે. (Smit has been playing cricket for two hours.)',
            usage: 'ભૂતકાળમાં શરૂ થયેલી અને હજી પણ ચાલુ રહેલી ક્રિયાઓ માટે વપરાય છે.'
          },
          {
            subtitle: 'સાદો ભૂતકાળ (Simple Past Tense)',
            syntax: 'કર્તા + ક્રિયાપદ (ભૂતકાળ) + કર્મ',
            example: 'સ્મિત ક્રિકેટ રમ્યો. (Smit played cricket.)',
            usage: 'ભૂતકાળમાં પૂર્ણ થયેલી ક્રિયાઓ માટે વપરાય છે.'
          },
          {
            subtitle: 'ચાલુ ભૂતકાળ (Past Continuous Tense)',
            syntax: 'કર્તા + હતો/હતી/હતા + ક્રિયાપદ + ઉં + કર્મ',
            example: 'સ્મિત ક्रિકેટ રમી રહ્યો હતો. (Smit was playing cricket.)',
            usage: 'ભૂતકાળમાં ચોક્કસ સમયે ચાલુ હતી તેવી ક્રિયાઓ માટે વપરાય છે.'
          },
          {
            subtitle: 'પૂર્ણ ભૂતકાળ (Past Perfect Tense)',
            syntax: 'કર્તા + ચૂક્યો/ચૂકી/ચૂક્યા + હતો/હતી/હતા + ક્રિયાપદ + કર્મ',
            example: 'વરસાદ આવતા પહેલા સ્મિત ક્રિકેટ રમી ચૂક્યો હતો. (Smit had played cricket before it rained.)',
            usage: 'ભૂતકાળમાં બીજી ક્રિયા થતા પહેલા પૂર્ણ થયેલી ક્રિયાઓ માટે વપરાય છે.'
          },
          {
            subtitle: 'પૂર્ણ ચાલુ ભૂતકાળ (Past Perfect Continuous Tense)',
            syntax: 'કર્તા + ચૂક્યો/ચૂકી/ચૂક્યા + હતો/હતી/હતા + ક્રિયાપદ + ઉં + કર્મ',
            example: 'વરસાદ આવ્યો ત્યારે સ્મિત બે કલાકથી ક્રિકેટ રમી રહ્યો હતો. (Smit had been playing cricket for two hours when it started raining.)',
            usage: 'ભૂતકાળમાં ચાલુ હતી અને બીજી ક્રિયાથી અટકાવાયેલી ક્રિયાઓ માટે વપરાય છે.'
          },
          {
            subtitle: 'સાદો ભવિષ્યકાળ (Simple Future Tense)',
            syntax: 'કર્તા + શકે/શકશે + ક્રિયાપદ + કર્મ',
            example: 'સ્મિત આવતીકાલે ક्रિકેટ રમશે. (Smit will play cricket tomorrow.)',
            usage: 'ભવિષ્યમાં થનારી ક્રિયાઓ માટે વપરાય છે.'
          },
          {
            subtitle: 'ચાલુ ભવિષ્યકાળ (Future Continuous Tense)',
            syntax: 'કર્તા + રહેશે/રહેશો + ક્રિયાપદ + ઉં + કર્મ',
            example: 'સ્મિત આવતીકાલે આ સમયે ક्रિકેટ રમી રહ્યો હશે. (Smit will be playing cricket at this time tomorrow.)',
            usage: 'ભવિષ્યમાં ચોક્કસ સમયે ચાલુ રહેલી ક્રિયાઓ માટે વપરાય છે.'
          },
          {
            subtitle: 'પૂર્ણ ભવિષ્યકાળ (Future Perfect Tense)',
            syntax: 'કર્તા + ચૂકશે/ચૂકશો + ક્રિયાપદ + કર્મ',
            example: 'સ્મિત સાંજે 5 વાગ્યા સુધીમાં ક्रિકેટ રમી ચૂકશે. (Smit will have played cricket by 5 PM.)',
            usage: 'ભવિષ્યમાં ચોક્કસ સમય સુધીમાં પૂર્ણ થઈ ચૂકેલી ક્રિયાઓ માટે વપરાય છે.'
          },
          {
            subtitle: 'પૂર્ણ ચાલુ ભવિષ્યકાળ (Future Perfect Continuous Tense)',
            syntax: 'કર્તા + ચૂકશે/ચૂકશો + હશે + ક્રિયાપદ + ઉં + કર્મ',
            example: 'સાંજે 5 વાગ્યા સુધીમાં સ્મિત બે કલાકથી ક्रિકેટ રમી રહ્યો હશે. (Smit will have been playing cricket for two hours by 5 PM.)',
            usage: 'ભવિષ્યમાં ચોક્કસ સમય સુધીમાં ચાલુ રહેલી ક્રિયાઓ માટે વપરાય છે.'
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
          },
          {
            subtitle: 'Future Simple',
            syntax: 'Active: Subject + will/shall + V1 + Object\nPassive: Object + will be + V3 + by + Subject',
            example: 'Active: She will write a letter.\nPassive: A letter will be written by her.',
            usage: 'Used for future actions where the focus is on the action rather than the doer.'
          },
          {
            subtitle: 'Present Continuous',
            syntax: 'Active: Subject + is/am/are + V1 + ing + Object\nPassive: Object + is/am/are + being + V3 + by + Subject',
            example: 'Active: She is writing a letter.\nPassive: A letter is being written by her.',
            usage: 'Used for ongoing actions where the focus is on the action rather than the doer.'
          },
          {
            subtitle: 'Past Continuous',
            syntax: 'Active: Subject + was/were + V1 + ing + Object\nPassive: Object + was/were + being + V3 + by + Subject',
            example: 'Active: She was writing a letter.\nPassive: A letter was being written by her.',
            usage: 'Used for past ongoing actions where the focus is on the action rather than the doer.'
          }
        ],
        gujarati: [
          {
            subtitle: 'વર્તમાન સાદો કાળ',
            syntax: 'કર્તરિ: કર્તા + ક્રિયાપદ + કર્મ\nકર્મણિ: કર્મ + ક્રિયાપદ (અનુકૂળ રૂપ) + કર્તા',
            example: 'કર્તરિ: તે પત્ર લખે છે.\nકર્મણિ: પત્ર લખાય છે તેના દ્વારા.',
            usage: 'જ્યાં ક્રિયા પર ભાર હોય અને કર્તા પર નહીં ત્યાં વપરાય છે.'
          },
          {
            subtitle: 'ભૂતકાળ સાદો કાળ',
            syntax: 'કર્તરિ: કર્તા + ક્રિયાપદ (ભૂતકાળ) + કર્મ\nકર્મણિ: કર્મ + ક્રિયાપદ (અનુકૂળ રૂપ) + કર્તા',
            example: 'કર્તરિ: તે પત્ર લખ્યું.\nકર્મણિ: પત્ર લખાયું તેના દ્વારા.',
            usage: 'ભૂતકાળમાં પૂર્ણ થયેલી ક્રિયાઓ માટે વપરાય છે જ્યાં કર્તા અજ્ઞાત અથવા અમહત્વપૂર્ણ હોય.'
          },
          {
            subtitle: 'ભવિષ્યકાળ સાદો કાળ',
            syntax: 'કર્તરિ: કર્તા + શકે/શકશે + ક્રિયાપદ + કર્મ\nકર્મણિ: કર્મ + ક્રિયાપદ (અનુકૂળ રૂપ) + કર્તા',
            example: 'કર્તરિ: તે પત્ર લખશે.\nકર્મણિ: પત્ર લખાશે તેના દ્વારા.',
            usage: 'ભવિષ્યમાં થનારી ક્રિયાઓ માટે વપરાય છે જ્યાં ક્રિયા પર ભાર હોય અને કર્તા પર નહીં.'
          },
          {
            subtitle: 'વર્તમાન ચાલુ કાળ',
            syntax: 'કર્તરિ: કર્તા + છે/છું/છો + ક્રિયાપદ + ઉં + કર્મ\nકર્મણિ: કર્મ + ક્રિયાપદ (અનુકૂળ રૂપ) + કર્તા',
            example: 'કર્તરિ: તે પત્ર લખી રહ્યો છે.\nકર્મણિ: પત્ર લખાય છે તેના દ્વારા.',
            usage: 'ચાલુ ક્રિયાઓ માટે વપરાય છે જ્યાં ક્રિયા પર ભાર હોય અને કર્તા પર નહીં.'
          },
          {
            subtitle: 'ભૂતકાળ ચાલુ કાળ',
            syntax: 'કર્તરિ: કર્તા + હતો/હતી/હતા + ક્રિયાપદ + ઉં + કર્મ\nકर્મણિ: કર્મ + ક્રિયાપદ (અનુકૂળ રૂપ) + કર્તા',
            example: 'કર્તરિ: તે પત્ર લખી રહ્યો હતો.\nકર્મણિ: પત્ર લખાય છે તેના દ્વારા.',
            usage: 'ભૂતકાળમાં ચાલુ હતી તેવી ક્રિયાઓ માટે વપરાય છે જ્યાં ક્રિયા પર ભાર હોય અને કર્તા પર નહીં.'
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
          },
          {
            subtitle: 'Adjectives',
            syntax: 'Words that describe or modify nouns',
            example: 'beautiful, tall, intelligent, happy',
            usage: 'Provide more information about nouns.'
          },
          {
            subtitle: 'Adverbs',
            syntax: 'Words that modify verbs, adjectives, or other adverbs',
            example: 'quickly, very, well, always',
            usage: 'Provide information about how, when, where, or to what extent.'
          },
          {
            subtitle: 'Pronouns',
            syntax: 'Words that replace nouns',
            example: 'he, she, it, they, we, you',
            usage: 'Used to avoid repetition of nouns.'
          },
          {
            subtitle: 'Prepositions',
            syntax: 'Words that show relationship between nouns/pronouns and other words',
            example: 'in, on, at, by, for, with',
            usage: 'Indicate position, direction, time, or manner.'
          },
          {
            subtitle: 'Conjunctions',
            syntax: 'Words that connect words, phrases, or clauses',
            example: 'and, but, or, because, although',
            usage: 'Join ideas and show relationship between them.'
          },
          {
            subtitle: 'Interjections',
            syntax: 'Words or phrases that express strong emotion',
            example: 'wow, oh, ouch, hurray',
            usage: 'Express sudden feelings or emotions.'
          }
        ],
        gujarati: [
          {
            subtitle: 'નામ (Nouns)',
            syntax: 'વ્યક્તિ, સ્થાન, વસ્તુ અથવા વિચારને નામ આપતા શબ્દો',
            example: 'શિક્ષક, શહેર, પુસ્તક, સુખ',
            usage: 'વાક્યમાં કર્તા, કર્મ અથવા પૂરક તરીકે વપરાય છે.'
          },
          {
            subtitle: 'ક્રિયાપદ (Verbs)',
            syntax: 'ક્રિયા અથવા અવસ્થા દર્શાવતા શબ્દો',
            example: 'દોડવું, છે, વિચારવું, બનવું',
            usage: 'વાક્યમાં predicate બનાવવા માટે આવશ્યક છે.'
          },
          {
            subtitle: 'વિશેષણ (Adjectives)',
            syntax: 'નામને વર્ણનારા અથવા સુધારતા શબ્દો',
            example: 'સુંદર, ઊંચું, બુદ્ધિશાળી, ખુશ',
            usage: 'નામ વિશે વધારે માહિતી પૂરી પાડે છે.'
          },
          {
            subtitle: 'ક્રિયાવિશેષણ (Adverbs)',
            syntax: 'ક્રિયાપદ, વિશેષણ અથવા અન્ય ક્રિયાવિશેષણને સુધારતા શબ્દો',
            example: 'ઝડપથી, ખૂબ જ, સારી રીતે, હમેશા',
            usage: 'કેવી રીતે, ક્યારે, ક્યાં, અથવા કેટલી હદ સુધી તે વિશે માહિતી પૂરી પાડે છે.'
          },
          {
            subtitle: 'સર્વનામ (Pronouns)',
            syntax: 'નામની જગ્યાએ વપરાતા શબ્દો',
            example: 'તે, તેણી, તે, તેઓ, અમે, તમે',
            usage: 'નામની પુનરાવર્તિત ટાળવા માટે વપરાય છે.'
          },
          {
            subtitle: 'વિભક્તિ (Prepositions)',
            syntax: 'નામ/સર્વનામ અને અન્ય શબ્દો વચ્ચેનો સંબંધ દર્શાવતા શબ્દો',
            example: 'માં, પર, પર, દ્વારા, માટે, સાથે',
            usage: 'સ્થિતિ, દિશા, સમય અથવા રીત દર્શાવે છે.'
          },
          {
            subtitle: 'યોજક (Conjunctions)',
            syntax: 'શબ્દો, શબ્દસમૂહો અથવા ઉપવાક્યોને જોડતા શબ્દો',
            example: 'અને, પરંતુ, અથવા, કારણ કે, છતાં',
            usage: 'વિચારોને જોડે છે અને તેમની વચ્ચેનો સંબંધ દર્શાવે છે.'
          },
          {
            subtitle: 'ઉદ્ગારવાચક (Interjections)',
            syntax: 'જોરદાર લાગણી વ્યક્ત કરતા શબ્દો અથવા શબ્દસમૂહો',
            example: 'વાહ, ઓહ, ઓય, હુરે',
            usage: 'અચાનક લાગણીઓ અથવા ભાવનાઓ વ્યક્ત કરે છે.'
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
          },
          {
            subtitle: 'Summarize Written Text',
            syntax: 'Identify main ideas → Write one complex sentence',
            example: 'Focus on key points and avoid examples/details',
            usage: 'Keep your summary within 5-75 words.'
          },
          {
            subtitle: 'Answer Short Questions',
            syntax: 'Listen carefully → Give concise answer',
            example: 'Usually one word or short phrase answers',
            usage: 'Focus on understanding the question before answering.'
          }
        ],
        gujarati: [
          {
            subtitle: 'જોરથી વાંચો (Read Aloud)',
            syntax: 'ધ્યાન કેન્દ્રિત કરો: ઉચ્ચાર, સરળતા, સામગ્રી',
            example: 'સમાચાર લેખો અને શૈક્ષણિક ગ્રંથો સાથે અભ્યાસ કરો',
            usage: 'કુચકિયા શબ્દો પર ભાર આપતા, કુદરતી ગતિથી સ્પષ્ટ બોલો.'
          },
          {
            subtitle: 'વાક્ય પુનરાવર્તન (Repeat Sentence)',
            syntax: 'ધ્યાન કેન્દ્રિત કરો: યાદશક્તિ, ઉચ્ચાર, સરળતા',
            example: 'તમે જે સાંભળો છો તે જ તણાવ અને સ્વર સાથે પુનરાવર્તન કરો',
            usage: 'માત્ર કીવર્ડ્સ નહીં, સંપૂર્ણ વાક્ય પકડવાનો પ્રયત્ન કરો.'
          },
          {
            subtitle: 'છબિ વર્ણન (Describe Image)',
            syntax: 'પરિચય → મુખ્ય લક્ષણો → નિષ્કર્ષ',
            example: '"આ છબિ દર્શાવે છે..." સાથે શરૂ કરો અને ટ્રેન્ડ્સ પર પ્રકાશ પાડો',
            usage: 'ગ્રાફ, ચાર્ટ અને ચિત્રો માટે યોગ્ય શબ્દભંડોળનો ઉપયોગ કરો.'
          },
          {
            subtitle: 'નિબંધ લેખન (Essay Writing)',
            syntax: 'પરિચય → મુખ્ય ફકરા → નિષ્કર્ષ',
            example: 'શૈક્ષણિક શબ્દભંડોળ અને જટિલ વાક્ય રચનાઓનો ઉપયોગ કરો',
            usage: 'લેખન શરૂ કરતા પહેલા તમારી નિબંધ રચનાની યોજના બનાવો.'
          },
          {
            subtitle: 'લેખિત લેખનનો સારાંશ (Summarize Written Text)',
            syntax: 'મુખ્ય વિચારો ઓળખો → એક જટિલ વાક્ય લખો',
            example: 'મુખ્ય મુદ્દાઓ પર ધ્યાન કેન્દ્રિત કરો અને ઉદાહરણો/વિગતો ટાળો',
            usage: 'તમારો સારાંશ 5-75 શબ્દોમાં રાખો.'
          },
          {
            subtitle: 'ટૂંકા પ્રશ્નોના જવાબ (Answer Short Questions)',
            syntax: 'કાળજીપૂર્વક સાંભળો → સંક્ષિપ્ત જવાબ આપો',
            example: 'સામાન્ય રીતે એક શબ્દ અથવા ટૂંકા શબ્દસમૂહના જવાબો',
            usage: 'જવાબ આપતા પહેલા પ્રશ્નને સમજવા પર ધ્યાન કેન્દ્રિત કરો.'
          }
        ]
      }
    }
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-indigo-600 p-4 md:p-6 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center">
              <Languages className="h-6 w-6 md:h-8 md:w-8 mr-2 md:mr-3" />
              <h1 className="text-xl md:text-2xl font-bold">
                {language === 'english' ? 'Grammar Guide' : 'વ્યાકરણ માર્ગદર્શિકા (Grammar Guide)'}
              </h1>
            </div>
            <Button
              onClick={() => setLanguage(language === 'english' ? 'gujarati' : 'english')}
              variant="secondary"
              className="bg-white text-indigo-600 hover:bg-indigo-100 text-sm md:text-base"
            >
              {language === 'english' ? 'ગુજરાતી (Gujarati)' : 'English'}
            </Button>
          </div>
          <p className="mt-2 text-sm md:text-base">
            {language === 'english' 
              ? 'Comprehensive grammar reference for PTE exam preparation' 
              : 'PTE પરીક્ષાની તૈયારી માટે વ્યાપક વ્યાકરણ સંદર્ભ'}
          </p>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
              {language === 'english' ? 'Grammar Topics' : 'વ્યાકરણ વિષયો (Grammar Topics)'}
            </h2>
            
            <div className="space-y-4">
              {grammarTopics.map((topic) => (
                <div key={topic.id} className="border rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleTopic(topic.id)}
                    className="w-full p-3 md:p-4 bg-gray-100 hover:bg-gray-200 flex justify-between items-center text-left"
                  >
                    <span className="font-medium text-sm md:text-base">{topic.title[language]}</span>
                    {activeTopic === topic.id ? (
                      <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
                    ) : (
                      <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                    )}
                  </button>
                  
                  {activeTopic === topic.id && (
                    <div className="p-3 md:p-4 bg-white border-t">
                      <div className="space-y-4 md:space-y-6">
                        {topic.content[language].map((item, index) => (
                          <div key={index} className="pb-4 border-b last:border-b-0 last:pb-0">
                            <h3 className="font-semibold text-base md:text-lg text-indigo-700 mb-2">
                              {item.subtitle}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                              <div className="bg-blue-50 p-3 rounded">
                                <h4 className="font-medium text-blue-800 text-sm md:text-base">
                                  {language === 'english' ? 'Syntax/Structure' : 'રચના (Syntax/Structure)'}
                                </h4>
                                <p className="mt-1 whitespace-pre-line text-xs md:text-sm">{item.syntax}</p>
                              </div>
                              <div className="bg-green-50 p-3 rounded">
                                <h4 className="font-medium text-green-800 text-sm md:text-base">
                                  {language === 'english' ? 'Example' : 'ઉદાહરણ (Example)'}
                                </h4>
                                <p className="mt-1 text-xs md:text-sm">{item.example}</p>
                              </div>
                              <div className="bg-purple-50 p-3 rounded">
                                <h4 className="font-medium text-purple-800 text-sm md:text-base">
                                  {language === 'english' ? 'Usage' : 'ઉપયોગ (Usage)'}
                                </h4>
                                <p className="mt-1 text-xs md:text-sm">{item.usage}</p>
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
          <div className="bg-yellow-50 p-4 md:p-6 rounded-lg border border-yellow-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <BookOpen className="h-4 w-4 md:h-5 md:w-5 mr-2 text-yellow-600" />
              {language === 'english' 
                ? 'General PTE Grammar Tips' 
                : 'સામાન્ય PTE વ્યાકરણ ટીપ્સ (General PTE Grammar Tips)'}
            </h2>
            
            <ul className="list-disc pl-5 space-y-2 text-sm md:text-base">
              {language === 'english' ? (
                <>
                  <li>Always check subject-verb agreement in your responses</li>
                  <li>Use appropriate tenses based on the context</li>
                  <li>Practice articles (a, an, the) as they're commonly tested</li>
                  <li>Learn common preposition combinations (depend on, interested in, etc.)</li>
                  <li>Use complex sentence structures to demonstrate language proficiency</li>
                  <li>Proofread your written responses for grammatical errors</li>
                  <li>Pay attention to word order in sentences</li>
                  <li>Use correct plural forms of nouns</li>
                  <li>Master the use of modal verbs (can, could, should, must, etc.)</li>
                </>
              ) : (
                <>
                  <li>તમારા જવાબોમાં કર્તા-ક્રિયા સહમતિ હમેશા તપાસો</li>
                  <li>સંદર્ભના આધારે યોગ્ય કાળનો ઉપયોગ કરો</li>
                  <li>આર્ટિકલ્સ (a, an, the) નો અભ્યાસ કરો કારણ કે તે સામાન્ય રીતે પરીક્ષામાં આવે છે</li>
                  <li>સામાન્ય પૂર્વનામ સંયોજનો શીખો (depend on, interested in, વગેરે)</li>
                  <li>ભાષા નિપુણતા દર્શાવવા માટે જટિલ વાક્ય રચનાઓનો ઉપયોગ કરો</li>
                  <li>વ્યાકરણની ભૂલો માટે તમારા લેખિત જવાબોની પ્રૂફરીડિંગ કરો</li>
                  <li>વાક્યોમાં શબ્દ ક્રમ પર ધ્યાન આપો</li>
                  <li>નામોના સાચા બહુવચન રૂપોનો ઉપયોગ કરો</li>
                  <li>મોડલ ક્રિયાપદો (can, could, should, must, વગેરે) ના ઉપયોગમાં નિપુણતા મેળવો</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}