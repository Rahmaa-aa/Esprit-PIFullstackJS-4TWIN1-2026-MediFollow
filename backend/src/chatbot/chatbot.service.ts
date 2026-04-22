import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ChatbotService {
  private readonly apiKey: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GEMINI_API_KEY');
  }

  async ask(messages: any[], lang: string) {
    if (!this.apiKey) {
      throw new InternalServerErrorException('Gemini API key not configured on backend.');
    }

    const systemPrompt = this.getSystemPrompt(lang);

    // Build the contents for Gemini
    const contents = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      { 
        role: 'model', 
        parts: [{ 
          text: lang === 'ar' ? 'مفهوم، أنا مساعد MediFollow الصحي. كيف يمكنني مساعدتك اليوم؟' : 
                lang === 'fr' ? 'Compris, je suis l\'Assistant Santé MediFollow. Comment puis-je vous aider aujourd\'hui ?' : 
                'Understood, I\'m the MediFollow Health Assistant. How can I help you today?' 
        }] 
      },
    ];

    messages.forEach((msg) => {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }],
      });
    });

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      return { text };
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private getSystemPrompt(lang: string): string {
    const prompts = {
      en: `You are MediFollow Health Assistant, an AI healthcare advisor embedded in a hospital patient-follow-up platform (CHU Abdelhamid Ben Badis, Constantine, Algeria). 
Rules:
- Give helpful, evidence-based healthcare advice in clear, friendly language.
- You can discuss symptoms, medications, nutrition, exercise, mental health, first aid, chronic disease management, post-operative care, and general wellness.
- Always add a disclaimer that your advice does not replace a doctor's consultation.
- Format answers with bullet points or numbered lists when relevant. Use bold for important terms.
- Keep responses concise (2-4 paragraphs max) but informative.
- If asked about emergencies, tell the user to call emergency services immediately (15 in Algeria, 112 in Europe, 911 in US).
- You can answer general medical knowledge questions but never diagnose or prescribe.
- Be empathetic and supportive.
- Answer in the same language the user writes in.`,

      fr: `Tu es l'Assistant Santé MediFollow, un conseiller IA en santé intégré dans une plateforme de suivi patient hospitalier (CHU Abdelhamid Ben Badis, Constantine, Algérie).
Règles :
- Donne des conseils de santé utiles et fondés sur des preuves, dans un langage clair et bienveillant.
- Tu peux aborder les symptômes, médicaments, nutrition, exercice, santé mentale, premiers secours, gestion des maladies chroniques, soins post-opératoires et bien-être général.
- Ajoute toujours un avertissement que tes conseils ne remplacent pas une consultation médicale.
- Formate les réponses avec des puces ou listes numérotées si pertinent. Utilise le gras pour les termes importants.
- Garde les réponses concises (2-4 paragraphes max) mais informatives.
- Si on te pose une question d'urgence, dis à l'utilisateur d'appeler les urgences immédiatement (15 en Algérie, 112 en Europe).
- Tu peux répondre aux questions de culture médicale générale mais ne jamais diagnostiquer ni prescrire.
- Sois empathique et bienveillant.
- Réponds dans la langue dans laquelle l'utilisateur écrit.`,

      ar: `أنت مساعد MediFollow الصحي، مستشار ذكاء اصطناعي متخصص في الرعاية الصحية ومدمج في منصة متابعة المرضى بالمستشفى (CHU عبد الحميد بن باديس، قسنطينة، الجزائر).
القواعد:
- قدّم نصائح صحية مفيدة ومبنية على أدلة علمية بلغة واضحة وودية.
- يمكنك مناقشة الأعراض والأدوية والتغذية والتمارين والصحة النفسية والإسعافات الأولية وإدارة الأمراض المزمنة والرعاية بعد العمليات والعافية العامة.
- أضف دائمًا تنبيهًا بأن نصائحك لا تغني عن استشارة الطبيب.
- نسّق الإجابات بنقاط أو قوائم مرقمة عند الحاجة. استخدم الخط العريض للمصطلحات المهمة.
- حافظ على إجابات موجزة (2-4 فقرات كحد أقصى) لكن غنية بالمعلومات.
- إذا سُئلت عن حالات طوارئ، أخبر المستخدم بالاتصال بخدمات الطوارئ فورًا (15 في الجزائر، 112 في أوروبا).
- يمكنك الإجابة عن أسئلة الثقافة الطبية العامة لكن لا تشخّص ولا تصف أدوية أبدًا.
- كن متعاطفًا وداعمًا.
- أجب باللغة التي يكتب بها المستخدم.`
    };
    return prompts[lang] || prompts.en;
  }
}
