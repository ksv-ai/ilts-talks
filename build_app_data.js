const fs = require('fs');
const path = require('path');

const lessonsDir = path.join(__dirname, 'IELTS_Prep', 'Lessons');

function parseTask1Files() {
    const task1Files = [
        { file: 'Strategy_1_Line_Graphs.txt', id: 'line' },
        { file: 'Strategy_2_Bar_Charts.txt', id: 'bar' },
        { file: 'Strategy_3_Pie_Charts.txt', id: 'pie' },
        { file: 'Strategy_4_Tables.txt', id: 'table' },
        { file: 'Strategy_5_Multiple_Charts.txt', id: 'multi' },
        { file: 'Strategy_6_Maps.txt', id: 'map' },
        { file: 'Strategy_7_Processes.txt', id: 'process' }
    ];

    let task1Data = {};

    for (const item of task1Files) {
        const filePath = path.join(lessonsDir, item.file);
        if (!fs.existsSync(filePath)) continue;

        const content = fs.readFileSync(filePath, 'utf-8');
        const sections = content.split('--------------------------------------------------').map(s => s.trim()).filter(s => s);

        const headerSection = sections[0].split('\n');
        const title = headerSection[0].replace('IELTS TASK 1 STRATEGY: ', '').trim();
        const strategyLines = headerSection.filter(line => line.startsWith('*')).map(line => line.replace('*', '').trim());

        let examples = [];
        for (let i = 1; i < sections.length; i++) {
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

            examples.push({
                title: titleMatch[1].trim(),
                prompt: promptMatch ? promptMatch[1].trim().replace(/\n/g, ' ') : "",
                planning: planningArr,
                essay: essayMatch ? essayMatch[1].trim() : ""
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
            
            // Extract the conversation block
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

// Preserve existing manual data by reading the file and extracting it if possible,
// but for simplicity, we will just redefine the static playbook and lenses here in the script,
// and combine them with the parsed dynamic data.

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
        lenses: {
            topics: [
                {
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
                {
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
                }
            ]
        },
        essays: ${JSON.stringify(parseTask2Files(), null, 4)}
    }
};
`;

fs.writeFileSync(path.join(__dirname, 'data.js'), dataJsContent);
console.log('Successfully compiled all IELTS data into data.js');
