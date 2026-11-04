export const CASE_ID='alder-morning-outage';
export const RELEASES=[{id:'morning',at:0,label:'8:20 a.m.'},{id:'records',at:6*60000,label:'8:45 a.m.'},{id:'recovery',at:13*60000,label:'9:05 a.m.'},{id:'brief',at:20*60000,label:'Follow-up'}];
export const CONTEXT=[
  'Alder Community Services coordinates daily meal deliveries from four hubs. Its RouteWell portal holds participant names, addresses, contact details and delivery instructions. Management must deliver essential meals while protecting those records. You are the internal-assurance team advising management during an interruption.',
  'At 8:10 a.m., dispatch staff cannot open RouteWell. The cause is unknown. No ransom demand has been received. Alder planned 480 deliveries, including 96 priority deliveries for participants who depend on the service. Priority deliveries are due by noon.',
  'Alder has an incident-response procedure. Technical responders must preserve relevant records while investigating the interruption and restoring service.'
];
export const RESPONSE_GUIDANCE='Use concise bullets or short paragraphs for your assessments. Support your judgments with relevant evidence IDs and identify important uncertainty. Keep the board statement within 70 words.';
export const REVIEW_GUIDANCE='Scope: what you will examine. Period: the dates your review will cover; explain why you chose them. Criterion: the expectation you will use to judge performance. Evidence source: the records you would examine. State what your evidence would leave unverified.';
export const AUTHORITY='The Operations Director leads service continuity. The IT Lead and support provider investigate, contain and restore systems. The Risk and Privacy Manager challenges the risk assessment and coordinates communication with Legal. The Executive Director authorizes major service or restoration decisions. The board receives significant-risk updates. Internal assurance evaluates and advises; it does not direct technical response or authorize reconnection.';
export const CONSTRAINTS='Use only the evidence released to your team. State assumptions as assumptions. Recommend proportionate action while further facts are gathered. Do not assume an attack, theft or successful containment from a single indicator.';
export const CRITERIA='Consider harm from delayed meals, harm from wrong delivery information, exposure of participant information, the reliability of evidence and the practical capacity of staff. No option removes every risk. Management must document the basis for the chosen route and monitor its results.';
export const RECORDS=[
 {id:'E1',title:'Dispatch report',body:'The portal has been unavailable since 8:10. Alder has not yet confirmed which functions are affected.'},
 {id:'E2',title:'Access alert',body:'An alert records a 2:13 a.m. sign-in using a shared provider support account from an unfamiliar network. The sign-in’s purpose and user are unconfirmed.'},
 {id:'E3',title:'Backup status',body:'The prior evening’s backup job shows success. A full restoration has not been tested during the past six months.'},
 {id:'E4',title:'Provider statement',body:'Approved maintenance ended at 1:50 a.m. The provider has not identified who used its shared account at 2:13. This support account is exempt from Alder’s multifactor authentication requirement.'},
 {id:'E5',title:'Comparison',body:'Operations compared eight priority-delivery addresses in a cached route file with approved participant registrations. Three differ. No approved address-change record for those three has yet been located. The eight records were selected for convenience.'},
 {id:'E6',title:'Activity record',body:'A portal log records acceptance of an export request for 480 participant records at 2:15 a.m. Alder does not yet have evidence of completion, transfer destination or actual receipt.'},
 {id:'E7',title:'Continuity option',body:'Operations has approved paper registrations and a separate phone list. Staff can verify addresses before dispatch, track deliveries on a controlled list and reconcile them later. Capacity is limited to 96 priority deliveries before noon.'},
 {id:'E8',title:'Technical response',body:'IT reports the shared account disabled, active sessions revoked and affected connections isolated. Supporting records have not yet been independently reviewed. Evidence preservation is being coordinated by the technical responders. The provider is examining whether the export completed and where any data went; results are pending.'},
 {id:'E9',title:'Restoration pilot',body:'In a separate recovery environment, IT restored 20 selected records from the backup and opened the application. Operations compared all 20 with approved registrations; two addresses differ. These 20 were selected for diagnosis, not statistical estimation, and do not establish results for the other 460.'},
 {id:'E10',title:'Continuity result',body:'Staff verified addresses against approved registrations and dispatched 22 of the 96 priority deliveries on the controlled manual list. Seventy-four priority deliveries remain. No manual delivery has yet been confirmed complete.'},
 {id:'E11',title:'Proposed message',body:'The Executive Director proposes telling the board: “The backup worked, so all participant information is safe and full service can restart.”'}
];
export const DOCUMENTS=[
 {id:'situation',release:'morning',title:'8:20 situation report',owner:'Operations Director',type:'Situation report',records:['E1','E2','E3'],intro:CONTEXT,context:true},
 {id:'provider',release:'records',title:'Provider support statement',owner:'IT Lead',type:'Provider statement',records:['E4']},
 {id:'addresses',release:'records',title:'Priority address comparison',owner:'Operations Director',type:'Comparison report',records:['E5']},
 {id:'export',release:'records',title:'Portal export activity',owner:'IT Lead',type:'Activity record',records:['E6']},
 {id:'continuity',release:'records',title:'Priority service continuity plan',owner:'Operations Director',type:'Service plan',records:['E7']},
 {id:'response',release:'recovery',title:'Technical response update',owner:'IT Lead',type:'Response update',records:['E8']},
 {id:'pilot',release:'recovery',title:'Restoration pilot review',owner:'Operations Director',type:'Validation report',records:['E9']},
 {id:'dispatch',release:'recovery',title:'Priority dispatch progress',owner:'Operations Director',type:'Service report',records:['E10']},
 {id:'board',release:'recovery',title:'Draft board message',owner:'Executive Director',type:'Draft message',records:['E11']}
];
export const MESSAGES=[
 {id:'morning',sender:'Operations Director',subject:'RouteWell interruption — initial briefing',preview:'The 8:20 situation report is ready for your team.',body:['The 8:20 situation report is available in Alder Drive. It includes the current service position, access alert and backup status.','Please identify the most urgent business exposure and recommend two immediate management actions. Name an owner and request evidence for each. Record what you can conclude now and what remains unknown.'],docs:['situation']},
 {id:'records',sender:'Risk and Privacy Manager',subject:'Additional records now available',preview:'Provider, address, export and continuity records have arrived.',body:['New information is available in Alder Drive. Please review the four attached records and revise your team’s assessment.','Explain what changed in confidentiality, integrity and availability. Recommend how management should handle service continuity and the newly identified exposure. Assign response, challenge and independent-evaluation responsibilities, and identify two evidence requests that would most affect the next decision.','Distinguish a confirmed record difference, an indicator of possible unauthorized activity and an unresolved question. Retain your earlier assessment and explain why your judgment changed.'],docs:['provider','addresses','export','continuity']},
 {id:'recovery',sender:'Executive Director',subject:'Recovery information and board brief',preview:'Review the response, pilot, dispatch report and draft board message.',body:['The latest response and recovery records are in Alder Drive, along with the proposed board message.','Management must choose whether to resume full portal-based service, continue controlled priority service while recovery is validated, or pause dispatch pending further validation. You may propose another route if you define its boundaries and explain feasibility.','Recommend a route and explain the tradeoff. State the conditions management must verify before expanding service, who authorizes that expansion and how exceptions will be monitored.','Replace the proposed board statement with a supported statement of no more than 70 words covering what is known, what remains unverified and management’s next action. Propose one later internal-assurance review with a defined scope, period, criterion and evidence source. Separate that review from management’s immediate response.'],docs:['response','pilot','dispatch','board']},
 {id:'brief',sender:'Executive Director',subject:'Please finalize your team brief',preview:'Bring your recommendation and board statement together.',body:['Please finish your team’s internal-assurance brief, retaining the initial position and both revisions. Check that the board statement is no more than 70 words.','Download one final brief for your team and submit it as directed.'],docs:[]}
];
export const SECTIONS=[
 {id:'initial',release:'morning',label:'8:20 assessment',description:'Assess the initial position using the available records.',fields:[
  {id:'exposure',label:'Most urgent business exposure',help:'Explain the threatened objective and cite relevant evidence IDs.'},
  {id:'actions',label:'Two immediate management actions',help:'For each action, name an owner and request supporting evidence.'},
  {id:'initialLimits',label:'What is known and what remains unknown',help:'State your present conclusion and its limits.'}
 ]},
 {id:'revision',release:'records',label:'8:45 revision',description:'Retain your first assessment and explain how the new evidence changes your judgment.',fields:[
  {id:'changed',label:'Changes in confidentiality, integrity and availability',help:'Explain what changed and cite evidence IDs.'},
  {id:'service',label:'Service continuity recommendation',help:'Address the newly identified exposure and explain the tradeoff.'},
  {id:'roles',label:'Responsibilities',help:'Assign response, challenge and independent-evaluation responsibilities.'},
  {id:'requests',label:'Two decisive evidence requests',help:'Explain how each request would affect the next decision.'}
 ]},
 {id:'final',release:'recovery',label:'9:05 recommendation',description:'Recommend a service route and communicate the basis and limits of your judgment.',fields:[
  {id:'route',label:'Recommended route and tradeoff',help:'Define the route and explain why it fits the available evidence and constraints.'},
  {id:'conditions',label:'Conditions for expanding service',help:'State what must be verified, who authorizes expansion and how exceptions will be monitored.'},
  {id:'boardStatement',label:'Board statement',help:'No more than 70 words: known facts, unresolved questions and management’s next action.'},
  {id:'laterReview',label:'Later independent assurance review',help:REVIEW_GUIDANCE}
 ]}
];
