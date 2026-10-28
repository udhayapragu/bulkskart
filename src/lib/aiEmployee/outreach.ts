import { isAbsoluteHttpUrl } from './normalize';
import type { ManufacturerLead, OutreachLanguage } from './types';

export const OUTREACH_ELIGIBLE_STATUSES = ['Qualified', 'Ready for Outreach'] as const;

/**
 * Message bodies. Placeholders: {company}, {category}, {registrationUrl}.
 * Non-English bodies are machine-drafted starting points and must be reviewed by a
 * native speaker before any real use. Every body avoids promises of buyers, orders,
 * sales or revenue.
 */
const TEMPLATES: Record<OutreachLanguage, string> = {
  en: `Hello {company} team,

We are contacting you from Bulkskart, a B2B bulk-trading marketplace that connects manufacturers, wholesalers and business buyers. We noticed {company} manufactures {category}.

Registered manufacturers can list their products, receive buyer enquiries and request quotations on Bulkskart. Registration does not guarantee buyers, orders or sales.

If you are interested, you can register here: {registrationUrl}

If you do not want to receive messages from us, reply STOP and we will add you to our do-not-contact list.

Regards,
Bulkskart team`,

  hi: `नमस्ते {company} टीम,

हम Bulkskart की ओर से आपसे संपर्क कर रहे हैं। यह एक B2B थोक-व्यापार मार्केटप्लेस है जो निर्माताओं, थोक विक्रेताओं और व्यावसायिक खरीदारों को जोड़ता है। हमने देखा कि {company} {category} का निर्माण करती है।

पंजीकृत निर्माता Bulkskart पर अपने उत्पाद सूचीबद्ध कर सकते हैं, खरीदारों की पूछताछ पा सकते हैं और कोटेशन का अनुरोध प्राप्त कर सकते हैं। पंजीकरण से खरीदार, ऑर्डर या बिक्री की गारंटी नहीं मिलती।

यदि आप रुचि रखते हैं, तो यहाँ पंजीकरण करें: {registrationUrl}

यदि आप हमारे संदेश नहीं चाहते, तो STOP लिखकर उत्तर दें, और हम आपको संपर्क न करने की सूची में जोड़ देंगे।

धन्यवाद,
Bulkskart टीम`,

  ta: `வணக்கம் {company} குழுவினரே,

Bulkskart என்ற B2B மொத்த வர்த்தக தளத்திலிருந்து தொடர்பு கொள்கிறோம். இது உற்பத்தியாளர்கள், மொத்த விற்பனையாளர்கள் மற்றும் வணிக வாங்குபவர்களை இணைக்கும் தளம். {company} {category} தயாரிப்பதாக அறிந்தோம்.

பதிவு செய்த உற்பத்தியாளர்கள் தங்கள் தயாரிப்புகளை பட்டியலிடலாம், வாங்குபவர் விசாரணைகளைப் பெறலாம் மற்றும் மேற்கோள்களைக் கோரலாம். பதிவு செய்வதால் வாங்குபவர்கள், ஆர்டர்கள் அல்லது விற்பனை உறுதியாகாது.

ஆர்வமிருந்தால் இங்கே பதிவு செய்யலாம்: {registrationUrl}

எங்கள் செய்திகள் வேண்டாம் என்றால் STOP என பதிலளியுங்கள்; உங்களை தொடர்பு கொள்ளாத பட்டியலில் சேர்ப்போம்.

நன்றி,
Bulkskart குழு`,

  te: `నమస్కారం {company} బృందానికి,

Bulkskart అనే B2B హోల్‌సేల్ ట్రేడ్ మార్కెట్‌ప్లేస్ నుండి మేము మిమ్మల్ని సంప్రదిస్తున్నాము. ఇది తయారీదారులు, హోల్‌సేలర్లు మరియు వ్యాపార కొనుగోలుదారులను కలుపుతుంది. {company} {category} తయారు చేస్తున్నట్లు మేము గమనించాము.

నమోదైన తయారీదారులు తమ ఉత్పత్తులను జాబితా చేయవచ్చు, కొనుగోలుదారుల విచారణలు పొందవచ్చు మరియు కోట్‌లు అభ్యర్థించవచ్చు. నమోదు వల్ల కొనుగోలుదారులు, ఆర్డర్లు లేదా అమ్మకాలు హామీ ఇవ్వబడవు.

ఆసక్తి ఉంటే ఇక్కడ నమోదు చేసుకోండి: {registrationUrl}

మా సందేశాలు వద్దనుకుంటే STOP అని బదులివ్వండి; మిమ్మల్ని సంప్రదించని జాబితాలో చేరుస్తాము.

ధన్యవాదాలు,
Bulkskart బృందం`,

  ml: `നമസ്കാരം {company} ടീം,

Bulkskart എന്ന B2B മൊത്തവ്യാപാര മാർക്കറ്റ്പ്ലേസിൽ നിന്നാണ് ഞങ്ങൾ ബന്ധപ്പെടുന്നത്. ഇത് നിർമ്മാതാക്കളെയും മൊത്തവ്യാപാരികളെയും ബിസിനസ് വാങ്ങുന്നവരെയും ബന്ധിപ്പിക്കുന്നു. {company} {category} നിർമ്മിക്കുന്നതായി ഞങ്ങൾ ശ്രദ്ധിച്ചു.

രജിസ്റ്റർ ചെയ്ത നിർമ്മാതാക്കൾക്ക് ഉൽപ്പന്നങ്ങൾ ലിസ്റ്റ് ചെയ്യാനും വാങ്ങുന്നവരുടെ അന്വേഷണങ്ങൾ സ്വീകരിക്കാനും ക്വട്ടേഷനുകൾ അഭ്യർത്ഥിക്കാനും കഴിയും. രജിസ്ട്രേഷൻ വാങ്ങുന്നവരെയോ ഓർഡറുകളെയോ വിൽപ്പനയെയോ ഉറപ്പുനൽകുന്നില്ല.

താൽപ്പര്യമുണ്ടെങ്കിൽ ഇവിടെ രജിസ്റ്റർ ചെയ്യാം: {registrationUrl}

സന്ദേശങ്ങൾ വേണ്ടെങ്കിൽ STOP എന്ന് മറുപടി നൽകുക; ഞങ്ങൾ നിങ്ങളെ ബന്ധപ്പെടാത്ത പട്ടികയിൽ ചേർക്കും.

നന്ദി,
Bulkskart ടീം`,
};

export const OUTREACH_SUBJECT = 'Bulkskart: an invitation for your manufacturing business';

export type OutreachDraftResult =
  | { ok: true; subject: string; body: string; sources: string[] }
  | { ok: false; reason: string };

/**
 * Builds a draft only. There is no send path in this build: the caller must keep
 * drafts in review until a compliant, provider-confirmed channel is approved.
 */
export function buildOutreachDraft(
  lead: ManufacturerLead,
  language: OutreachLanguage,
  registrationUrl: string,
): OutreachDraftResult {
  if (lead.status === 'Do Not Contact') {
    return { ok: false, reason: 'Lead is on the Do Not Contact list.' };
  }
  if (!(OUTREACH_ELIGIBLE_STATUSES as readonly string[]).includes(lead.status)) {
    return { ok: false, reason: `Lead status "${lead.status}" is not eligible for outreach drafts.` };
  }
  if (!isAbsoluteHttpUrl(registrationUrl)) {
    return { ok: false, reason: 'Enter a full https:// registration link before drafting.' };
  }

  const category = lead.productCategory?.trim() || 'products';
  const body = TEMPLATES[language]
    .replace(/\{company\}/g, lead.companyName)
    .replace(/\{category\}/g, category)
    .replace(/\{registrationUrl\}/g, registrationUrl.trim());

  const sources = [
    lead.sourceUrl ? `Source: ${lead.sourceUrl}` : 'No source URL on record; personalization uses company name and category only.',
    `Research date: ${lead.researchDate ?? 'Not found'}`,
    `Verification: ${lead.verification}`,
  ];

  return { ok: true, subject: OUTREACH_SUBJECT, body, sources };
}
