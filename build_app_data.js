const fs = require('fs');
const path = require('path');

const lessonsDir = path.join(__dirname, 'IELTS_Prep', 'Lessons');
const figuresDir = path.join(__dirname, 'IELTS_Prep', 'Figures');
const individualDir = path.join(figuresDir, 'Individual');

if (!fs.existsSync(individualDir)) {
    fs.mkdirSync(individualDir, { recursive: true });
}

function parseTask1Files() {
    const task1Files = [
        { file: 'Strategy_1_Line_Graphs.txt', html: '1_Line_Graphs.html', id: 'line' },
        { file: 'Strategy_2_Bar_Charts.txt', html: '2_Bar_Charts.html', id: 'bar' },
        { file: 'Strategy_3_Pie_Charts.txt', html: '3_Pie_Charts.html', id: 'pie' },
        { file: 'Strategy_4_Tables.txt', html: '4_Tables.html', id: 'table' },
        { file: 'Strategy_5_Multiple_Charts.txt', html: '5_Multiple_Charts.html', id: 'multi' },
        { file: 'Strategy_6_Maps.txt', html: '6_Maps.html', id: 'map' },
        { file: 'Strategy_7_Processes.txt', html: '7_Processes.html', id: 'process' }
    ];

    let task1Data = {};

    for (const item of task1Files) {
        const filePath = path.join(lessonsDir, item.file);
        const htmlPath = path.join(figuresDir, item.html);
        
        let rawHtml = '';
        if (fs.existsSync(htmlPath)) {
            rawHtml = fs.readFileSync(htmlPath, 'utf-8');
        }

        if (!fs.existsSync(filePath)) continue;

        const content = fs.readFileSync(filePath, 'utf-8');
        const sections = content.split('--------------------------------------------------').map(s => s.trim()).filter(s => s);

        const headerSection = sections[0].split('\n');
        const title = headerSection[0].replace('IELTS TASK 1 STRATEGY: ', '').trim();
        const strategyLines = headerSection.filter(line => line.startsWith('*')).map(line => line.replace('*', '').trim());

        let examples = [];
        // The first section (index 0) is the title.
        // The second section (index 1) is the Core Strategy block.
        // The third section (index 2) is EXAMPLE 1.
        for (let i = 2; i < sections.length; i++) {
            const exContent = sections[i];
            const titleMatch = exContent.match(/EXAMPLE \d+: (.*)/);
            if (!titleMatch) continue;

            const promptMatch = exContent.match(/PROMPT: (.*?)(?=\n\n|\nPLANNING NOTE:|\nBAND 9 ESSAY:)/s);
            const planningMatch = exContent.match(/PLANNING NOTE:\n([\s\S]*?)(?=\n\nBAND 9 ESSAY:)/);
            const essayMatch = exContent.match(/BAND 9 ESSAY:\n([\s\S]*)/);

            let planningArr = [];
            if (planningMatch) {
                planningArr = planningMatch[1].split('\n').filter(line => line.startsWith('*')).map(line => line.replace('*', '').trim());
            }

            // Create Individual HTML file for this chart using the style hiding technique
            let figureUrl = null;
            const exampleNum = i - 1; // i=2 is Example 1, i=3 is Example 2, etc.
            
            if (rawHtml) {
                const hideStyle = `
                <style>
                    html, body { 
                        margin: 0 !important; 
                        padding: 0 !important; 
                        background: #ffffff !important; 
                        overflow: hidden !important;
                        height: 100% !important;
                        width: 100% !important;
                    }
                    /* Hide all containers */
                    .chart-container, .table-container { display: none !important; }
                    /* Show only the target container */
                    .chart-container:nth-of-type(${exampleNum}), .table-container:nth-of-type(${exampleNum}) { 
                        display: block !important; 
                        margin: 0 !important; 
                        box-shadow: none !important; 
                        width: 100% !important; 
                        height: 100% !important;
                        padding: 15px !important; 
                        box-sizing: border-box !important; 
                        overflow: hidden !important;
                    }
                    canvas {
                        max-height: 380px !important;
                        max-width: 100% !important;
                    }
                </style>
                `;
                
                // Inject the style block before </head>
                const modifiedHtml = rawHtml.replace('</head>', `${hideStyle}\n</head>`);
                const filename = `${item.id}_ex${exampleNum}.html`;
                fs.writeFileSync(path.join(individualDir, filename), modifiedHtml);
                figureUrl = filename;
            }

            examples.push({
                title: titleMatch[1].trim(),
                prompt: promptMatch ? promptMatch[1].trim().replace(/\n/g, ' ') : "",
                planning: planningArr,
                essay: essayMatch ? essayMatch[1].trim() : "",
                figureUrl: figureUrl
            });
        }

        task1Data[item.id] = {
            title: title,
            subtitle: "Mastering Task 1",
            strategy: strategyLines,
            examples: examples
        };
    }
    return task1Data;
}

function parseTask2Files() {
    const task2Files = [
        { file: 'Strategy_1_Opinion_Essays.txt', id: 'opinion' },
        { file: 'Strategy_2_Discuss_Both_Views.txt', id: 'discuss' },
        { file: 'Strategy_3_Advantages_Disadvantages.txt', id: 'adv' },
        { file: 'Strategy_4_Problem_Solution.txt', id: 'problem' },
        { file: 'Strategy_5_Two_Part_Questions.txt', id: 'twopart' }
    ];

    let task2EssaysData = {};

    for (const item of task2Files) {
        const filePath = path.join(lessonsDir, item.file);
        if (!fs.existsSync(filePath)) continue;

        const content = fs.readFileSync(filePath, 'utf-8');
        const sections = content.split('--------------------------------------------------').map(s => s.trim()).filter(s => s);

        const headerSection = sections[0].split('\n');
        const title = headerSection[0].replace('IELTS TASK 2 STRATEGY: ', '').trim();
        const scienceLines = headerSection.filter(line => line.startsWith('*')).map(line => line.replace('*', '').trim());

        let examples = [];
        for (let i = 1; i < sections.length; i++) {
            const exContent = sections[i];
            const titleMatch = exContent.match(/EXAMPLE \d+: (.*)/);
            if (!titleMatch) continue;

            const promptMatch = exContent.match(/PROMPT: (.*)/);
            const lensMatch = exContent.match(/LENS: (.*)/);
            
            const convMatch = exContent.match(/THE CONVERSATION.*?\n([\s\S]*?)(?=\n\nBAND 9 ESSAY:)/);
            let conversation = [];
            if (convMatch) {
                const lines = convMatch[1].split('\n').filter(line => line.trim().startsWith('*'));
                conversation = lines.map(line => {
                    let text = line.replace('*', '').trim();
                    let parts = text.split(':');
                    if(parts.length > 1) {
                        return { label: parts[0].trim(), text: parts.slice(1).join(':').trim() };
                    }
                    return { label: "Note", text: text };
                });
            }

            const essayMatch = exContent.match(/BAND 9 ESSAY:\n([\s\S]*)/);

            examples.push({
                title: titleMatch[1].trim(),
                prompt: promptMatch ? promptMatch[1].trim() : "",
                lens: lensMatch ? lensMatch[1].trim() : "",
                conversation: conversation,
                essay: essayMatch ? essayMatch[1].trim() : ""
            });
        }

        task2EssaysData[item.id] = {
            title: title,
            subtitle: "The Science Applied",
            science: scienceLines,
            examples: examples
        };
    }
    return task2EssaysData;
}

const lensesData = {
    "psychological": {
        name: "PSYCHOLOGICAL",
        concepts: ["Financial stress", "Emotional well-being", "Homesickness", "Job insecurity", "Self-esteem", "Motivation"],
        chains: [
            {
                title: "Financial Security → Peace of Mind",
                collocations: ["build an emergency fund", "prepare for unexpected situations", "increase financial security", "reduce financial stress", "provide peace of mind", "improve emotional well-being"],
                steps: [
                    "Saving money",
                    "build an emergency fund",
                    "prepare for unexpected situations",
                    "increase financial security",
                    "reduce financial stress",
                    "provide peace of mind",
                    "improve emotional well-being"
                ],
                paragraph: "Saving money improves psychological well-being by building an emergency fund that prepares individuals for unexpected situations. This increases financial security and significantly reduces financial stress, providing greater peace of mind. Consequently, people experience improved emotional well-being and enjoy higher overall life satisfaction."
            },
            {
                title: "Achievement → Self-Confidence",
                collocations: ["gain valuable experience", "improve competence", "develop self-confidence", "increase intrinsic motivation", "encourage lifelong learning"],
                steps: [
                    "Learning new skills",
                    "gain valuable experience",
                    "improve competence",
                    "develop self-confidence",
                    "increase intrinsic motivation",
                    "encourage lifelong learning",
                    "achieve personal growth"
                ],
                paragraph: "Learning new skills promotes personal development by allowing individuals to gain valuable experience and improve competence. As they become more capable, they naturally develop self-confidence, which increases motivation and encourages lifelong learning. Consequently, they are better equipped to achieve long-term personal and professional goals."
            },
            {
                title: "Social Support → Emotional Stability",
                collocations: ["receive emotional support", "share personal challenges", "reduce feelings of loneliness", "improve emotional resilience", "manage stress more effectively"],
                steps: [
                    "Strong social relationships",
                    "receive emotional support",
                    "share personal challenges",
                    "reduce feelings of loneliness",
                    "improve emotional resilience",
                    "manage stress more effectively",
                    "maintain better mental health"
                ],
                paragraph: "Strong social relationships improve mental health by allowing individuals to receive emotional support during difficult times. Sharing personal challenges helps reduce feelings of loneliness and improves emotional resilience. Consequently, people manage stress more effectively, maintain better mental health, and experience greater overall well-being."
            }
        ]
    },
    "environmental": {
        name: "ENVIRONMENTAL",
        concepts: ["Climate change", "Recycling", "Renewable energy", "Pollution", "Sustainability"],
        chains: [
            {
                title: "Renewable Energy → Sustainable Development",
                collocations: ["reduce dependence on fossil fuels", "lower carbon emissions", "improve air quality", "protect public health", "mitigate climate change", "preserve natural resources"],
                steps: [
                    "Renewable energy",
                    "reduce dependence on fossil fuels",
                    "lower carbon emissions",
                    "improve air quality",
                    "protect public health",
                    "mitigate climate change",
                    "promote sustainable development"
                ],
                paragraph: "Renewable energy protects the environment by reducing dependence on fossil fuels, which are a major source of greenhouse gas emissions. This helps lower carbon emissions and improve air quality, thereby protecting public health. Consequently, countries can mitigate climate change, promote sustainable development, and preserve natural resources for future generations."
            },
            {
                title: "Recycling → Waste Reduction",
                collocations: ["reduce household waste", "decrease landfill use", "conserve natural resources", "reduce energy consumption", "minimize environmental pollution"],
                steps: [
                    "Recycling",
                    "reduce household waste",
                    "decrease landfill use",
                    "conserve natural resources",
                    "reduce energy consumption",
                    "minimize environmental pollution"
                ],
                paragraph: "Recycling benefits the environment by reducing household waste, thereby decreasing the amount of rubbish sent to landfills. This helps conserve natural resources and reduce energy consumption, since manufacturing products from recycled materials often requires fewer resources. Consequently, recycling minimizes environmental pollution, protects ecosystems, and supports sustainable living."
            }
        ]
    },
    "economic": {
        name: "ECONOMIC",
        concepts: ["Job creation", "Financial stability", "Tax revenue", "Poverty reduction", "Economic growth", "Infrastructure investment"],
        chains: [
            {
                title: "Education Investment → Economic Growth",
                collocations: ["subsidize tertiary education", "eliminate financial barriers", "cultivate a highly skilled workforce", "attract corporate investment", "drive technological innovation", "stimulate national economic growth"],
                steps: [
                    "Government funds universities",
                    "eliminate financial barriers for students",
                    "cultivate a highly skilled workforce",
                    "attract corporate investment",
                    "drive technological innovation",
                    "stimulate national economic growth"
                ],
                paragraph: "Governments should heavily subsidize tertiary education to eliminate financial barriers and allow students from all backgrounds to study. This cultivates a highly skilled workforce, which is essential for attracting corporate investment and driving technological innovation. Consequently, a highly educated population stimulates long-term national economic growth and prosperity."
            },
            {
                title: "Infrastructure Development → Job Creation",
                collocations: ["invest in public infrastructure", "stimulate the construction sector", "generate employment opportunities", "reduce national unemployment", "boost consumer spending"],
                steps: [
                    "Invest in public infrastructure",
                    "stimulate the construction sector",
                    "generate employment opportunities",
                    "reduce national unemployment",
                    "boost consumer spending",
                    "strengthen the local economy"
                ],
                paragraph: "Investing heavily in public infrastructure, such as new railways or airports, directly stimulates the construction sector. This generates thousands of immediate employment opportunities, substantially reducing national unemployment rates. As a result, newly employed citizens boost consumer spending, thereby strengthening the entire local economy."
            }
        ]
    },
    "technological": {
        name: "TECHNOLOGICAL",
        concepts: ["Automation", "Efficiency", "Digital literacy", "Cybersecurity", "Global connectivity", "Innovation"],
        chains: [
            {
                title: "Automation → Workplace Efficiency",
                collocations: ["implement automated systems", "execute repetitive tasks", "eliminate human error", "streamline operational workflows", "maximize corporate efficiency"],
                steps: [
                    "Implement automated systems",
                    "execute repetitive tasks instantly",
                    "eliminate human error",
                    "streamline operational workflows",
                    "maximize corporate efficiency",
                    "increase profit margins"
                ],
                paragraph: "Implementing automated AI systems allows companies to execute repetitive administrative tasks instantly while eliminating costly human errors. By streamlining these operational workflows, businesses maximize corporate efficiency and reduce overhead costs. Therefore, technology is an indispensable tool for increasing overall profit margins in modern industries."
            },
            {
                title: "Digital Communication → Global Connectivity",
                collocations: ["utilize social media platforms", "eradicate geographical barriers", "facilitate instant communication", "maintain international relationships", "prevent social isolation"],
                steps: [
                    "Utilize social media platforms",
                    "eradicate geographical barriers",
                    "facilitate instant communication",
                    "maintain international relationships",
                    "prevent social isolation"
                ],
                paragraph: "Social media platforms have eradicated geographical barriers by facilitating instant, free communication across the globe. This allows families separated by vast distances to effortlessly maintain international relationships via video calls. As a result, technology prevents social isolation and sustains crucial emotional bonds regardless of physical location."
            }
        ]
    },
    "educational": {
        name: "EDUCATIONAL",
        concepts: ["Critical thinking", "Practical skills", "Academic pressure", "Lifelong learning", "Equal opportunity"],
        chains: [
            {
                title: "Practical Learning → Employability",
                collocations: ["incorporate vocational training", "simulate real-world challenges", "develop practical competencies", "bridge the skills gap", "enhance graduate employability"],
                steps: [
                    "Incorporate vocational training",
                    "simulate real-world challenges",
                    "develop practical competencies",
                    "bridge the skills gap",
                    "enhance graduate employability"
                ],
                paragraph: "Incorporating vocational training into university curriculums allows students to simulate real-world corporate challenges. This develops practical competencies, such as software proficiency or project management, which directly bridges the skills gap between academia and industry. Consequently, this hands-on experience drastically enhances graduate employability in a competitive market."
            }
        ]
    },
    "health": {
        name: "HEALTH & MEDICAL",
        concepts: ["Preventive healthcare", "Sedentary lifestyles", "Mental well-being", "Dietary habits", "Public awareness"],
        chains: [
            {
                title: "Preventive Care → Reduced Healthcare Costs",
                collocations: ["promote preventive healthcare", "encourage regular physical exercise", "lower the incidence of chronic diseases", "alleviate pressure on hospitals", "reduce national healthcare expenditures"],
                steps: [
                    "Promote preventive healthcare",
                    "encourage regular physical exercise",
                    "lower the incidence of chronic diseases",
                    "alleviate pressure on hospitals",
                    "reduce national healthcare expenditures"
                ],
                paragraph: "Governments must promote preventive healthcare by encouraging regular physical exercise and healthy diets among citizens. This proactive approach significantly lowers the incidence of chronic diseases, such as obesity or diabetes, thereby alleviating immense pressure on public hospitals. Ultimately, a healthier population drastically reduces national healthcare expenditures."
            }
        ]
    },
    "social": {
        name: "SOCIAL",
        concepts: ["Community cohesion", "Civic responsibility", "Marginalized groups", "Social mobility", "Cultural integration"],
        chains: [
            {
                title: "Community Service → Civic Responsibility",
                collocations: ["mandate community service", "expose youth to societal challenges", "foster deep empathy", "cultivate civic responsibility", "create a cohesive society"],
                steps: [
                    "Mandate community service",
                    "expose youth to societal challenges",
                    "foster deep empathy",
                    "cultivate civic responsibility",
                    "create a cohesive society"
                ],
                paragraph: "Mandating community service in high schools exposes youth directly to real-world societal challenges, such as poverty or homelessness. Interacting with vulnerable populations fosters deep empathy and cultivates a profound sense of civic responsibility. As a result, these programs are instrumental in creating a more cohesive, compassionate society."
            }
        ]
    },
    "cultural": {
        name: "CULTURAL",
        concepts: ["Globalized perspective", "Traditional heritage", "Cultural preservation", "Language barriers", "Stereotypes"],
        chains: [
            {
                title: "International Travel → Open-mindedness",
                collocations: ["immerse in foreign environments", "navigate cultural differences", "dismantle preconceived stereotypes", "adopt a globalized perspective", "promote international tolerance"],
                steps: [
                    "Immerse in foreign environments",
                    "navigate cultural differences",
                    "dismantle preconceived stereotypes",
                    "adopt a globalized perspective",
                    "promote international tolerance"
                ],
                paragraph: "Immersing oneself in foreign environments through international travel or study forces individuals to navigate complex cultural differences. This direct interaction effectively dismantles preconceived stereotypes and encourages students to adopt a globalized perspective. Therefore, cross-cultural exposure is highly effective at promoting international tolerance and understanding."
            }
        ]
    },
    "government": {
        name: "GOVERNMENT & POLICY",
        concepts: ["Legislative intervention", "Taxation", "Public funding", "Regulation", "Social welfare"],
        chains: [
            {
                title: "Taxation → Behavioral Change",
                collocations: ["implement prohibitive taxation", "artificially inflate prices", "suppress consumer demand", "force behavioral change", "achieve public policy goals"],
                steps: [
                    "Implement prohibitive taxation",
                    "artificially inflate prices of harmful goods",
                    "suppress consumer demand",
                    "force behavioral change",
                    "achieve public policy goals"
                ],
                paragraph: "Governments can effectively combat issues like junk food consumption or plastic waste by implementing prohibitive taxation. This artificially inflates the prices of harmful goods, which naturally suppresses mass consumer demand. By targeting the public's financial habits, authorities can force rapid behavioral change and successfully achieve public policy goals."
            }
        ]
    },
    "infrastructure": {
        name: "INFRASTRUCTURE",
        concepts: ["Urban planning", "Public transportation", "Traffic congestion", "Housing shortages", "Sustainable cities"],
        chains: [
            {
                title: "Public Transport → Reduced Congestion",
                collocations: ["subsidize mass transit networks", "provide reliable alternatives", "incentivize shared mobility", "reduce private vehicle dependency", "alleviate urban traffic congestion"],
                steps: [
                    "Subsidize mass transit networks",
                    "provide reliable alternatives to driving",
                    "incentivize shared mobility",
                    "reduce private vehicle dependency",
                    "alleviate urban traffic congestion"
                ],
                paragraph: "By heavily subsidizing underground mass transit networks, cities provide citizens with faster, reliable alternatives to driving. This incentivizes shared mobility and drastically reduces private vehicle dependency during rush hours. Consequently, expanding public transport is the most effective method for permanently alleviating urban traffic congestion."
            }
        ]
    },
    "consumerism": {
        name: "CONSUMERISM",
        concepts: ["Throwaway culture", "Materialism", "Brand loyalty", "Ethical purchasing", "Mass production"],
        chains: [
            {
                title: "Ethical Purchasing → Corporate Accountability",
                collocations: ["boycott unethical products", "exert financial pressure", "demand sustainable manufacturing", "enforce corporate accountability", "drive market innovation"],
                steps: [
                    "Boycott unethical products",
                    "exert financial pressure on manufacturers",
                    "demand sustainable manufacturing",
                    "enforce corporate accountability",
                    "drive market innovation"
                ],
                paragraph: "When consumers actively boycott unethical or polluting products, they exert immense financial pressure directly on manufacturers. Because businesses rely entirely on consumer demand, they are forced to adopt sustainable manufacturing processes to survive. Thus, ethical purchasing is a powerful tool for enforcing corporate accountability and driving market innovation."
            }
        ]
    }
};

const dataJsContent = `
window.ieltsData = {
    task1: ${JSON.stringify(parseTask1Files(), null, 4)},
    task2: {
        playbook: {
            families: [
                {
                    name: "FAMILY 1 — REASONS",
                    items: [
                        { pattern: "Because", formula: "S + V + because + clause", purpose: "Give a reason", example: "Exercise improves health because it strengthens the cardiovascular system." },
                        { pattern: "This is because", formula: "Sentence. This is because...", purpose: "Explain previous statement", example: "Public transport reduces congestion. This is because more commuters use shared vehicles." },
                        { pattern: "One of the main reasons is that", formula: "One of the main reasons is that...", purpose: "Strong academic explanation", example: "One of the main reasons saving money is beneficial is that it builds financial security." }
                    ]
                },
                {
                    name: "FAMILY 2 — MECHANISM",
                    items: [
                        { pattern: "by + Verb-ing", formula: "S + V + by + V-ing", purpose: "Explain how", example: "Exercise improves health by strengthening muscles." },
                        { pattern: "through + Noun / V-ing", formula: "through...", purpose: "Explain process", example: "Students learn through interacting with others." }
                    ]
                },
                {
                    name: "FAMILY 3 — RESULTS",
                    items: [
                        { pattern: "As a result", formula: "As a result...", purpose: "Immediate consequence", example: "People save money. As a result, they avoid debt." },
                        { pattern: "Consequently", formula: "Consequently,...", purpose: "Long-term consequence", example: "Students practise regularly. Consequently, they become more employable." },
                        { pattern: "Therefore", formula: "Therefore,...", purpose: "Conclude argument", example: "Therefore, everyone should exercise regularly." }
                    ]
                },
                {
                    name: "FAMILY 4 — PARTICIPLE CLAUSES (Compression)",
                    items: [
                        { pattern: "allowing...", formula: ", allowing...", purpose: "Gives opportunity", example: "Technology provides resources, allowing students to study independently." },
                        { pattern: "leading to...", formula: ", leading to...", purpose: "Next consequence", example: "Exercise strengthens muscles, leading to better health." },
                        { pattern: "resulting in...", formula: ", resulting in...", purpose: "Formal consequence", example: "Investment improves schools, resulting in better education." }
                    ]
                },
                {
                    name: "FAMILY 5 — CONCESSION & BALANCING",
                    items: [
                        { pattern: "Although", formula: "Although...", purpose: "Admit drawback", example: "Although studying abroad is expensive, it offers valuable experiences." },
                        { pattern: "While", formula: "While...", purpose: "Contrast", example: "While technology offers convenience, it may reduce face-to-face interaction." }
                    ]
                }
            ]
        },
        lenses: ${JSON.stringify(lensesData, null, 4)},
        essays: ${JSON.stringify(parseTask2Files(), null, 4)}
    }
};
`;

fs.writeFileSync(path.join(__dirname, 'data.js'), dataJsContent);
console.log('Successfully compiled all IELTS data into data.js');
