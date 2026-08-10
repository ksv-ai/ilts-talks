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

            let figureUrl = null;
            const exampleNum = i - 1; 
            
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
                    h2, .prompt, h3 { display: none !important; }
                    .chart-container, .table-container { display: none !important; }
                    .chart-container:nth-of-type(${exampleNum}), .table-container:nth-of-type(${exampleNum}) { 
                        display: block !important; 
                        margin: 0 !important; 
                        box-shadow: none !important; 
                        width: 100% !important; 
                        height: 100% !important;
                        padding: 10px !important; 
                        box-sizing: border-box !important; 
                        overflow: auto !important;
                    }
                    ::-webkit-scrollbar { width: 6px; height: 6px; }
                    ::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 4px; }
                    canvas {
                        width: 100% !important;
                        height: 95% !important;
                        max-height: 460px !important;
                    }
                </style>
                `;
                
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
                const rawLines = convMatch[1].split('\n').map(l => l.trim()).filter(l => l);
                rawLines.forEach(line => {
                    if (line.startsWith('THE CONVERSATION') || line.includes('Blueprint')) {
                        const heading = line.replace('THE CONVERSATION', '').replace(':', '').trim();
                        conversation.push({ isHeading: true, text: heading });
                    } else if (line.startsWith('*')) {
                        let text = line.replace('*', '').trim();
                        let parts = text.split(':');
                        if (parts.length > 1) {
                            conversation.push({ label: parts[0].trim(), text: parts.slice(1).join(':').trim() });
                        } else {
                            conversation.push({ label: "Note", text: text });
                        }
                    }
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
        concepts: ["emotional resilience", "psychological burnout", "cognitive flexibility", "intrinsic motivation", "mental equilibrium", "chronic fatigue", "emotional stability", "peace of mind", "sense of self-worth", "social isolation", "loneliness mitigation", "depression rates", "stress management", "neurological pathways", "adaptability capacity"],
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
            },
            {
                title: "Work-Life Balance → Reduced Burnout",
                collocations: ["prioritize personal time", "reduce working hours", "alleviate mental fatigue", "improve sleep quality", "foster positive mindset", "prevent professional burnout"],
                steps: [
                    "Moderate working hours",
                    "prioritize personal time",
                    "alleviate mental fatigue",
                    "improve sleep quality",
                    "foster positive mindset",
                    "prevent professional burnout"
                ],
                paragraph: "Limiting professional responsibilities helps individuals prioritize personal time, which is essential for alleviating mental fatigue. This directly improves sleep quality and fosters a positive mindset. Consequently, employees prevent professional burnout, maintain emotional stability, and perform better in their careers."
            },
            {
                title: "Mindfulness Practice → Stress Reduction",
                collocations: ["engage in mindfulness", "regulate emotional responses", "lower cortisol levels", "improve concentration", "enhance mental clarity", "reduce daily anxiety"],
                steps: [
                    "Mindfulness and meditation",
                    "regulate emotional responses",
                    "lower cortisol levels",
                    "improve concentration",
                    "enhance mental clarity",
                    "reduce daily anxiety"
                ],
                paragraph: "Engaging in mindfulness practices allows people to regulate their emotional responses to stress, which lowers cortisol levels. This improves concentration and enhances mental clarity in high-pressure situations. As a result, individuals reduce daily anxiety, boost their emotional resilience, and enjoy peace of mind."
            },
            {
                title: "Creative Outlets → Self-Expression",
                collocations: ["pursue creative hobbies", "express complex emotions", "release accumulated tension", "boost dopamine levels", "enhance self-worth", "improve mood regulation"],
                steps: [
                    "Creative outlets",
                    "express complex emotions",
                    "release accumulated tension",
                    "boost dopamine levels",
                    "enhance self-worth",
                    "improve mood regulation"
                ],
                paragraph: "Pursuing creative hobbies like painting or music allows individuals to express complex emotions that are hard to verbalize. This helps release accumulated tension and boosts dopamine levels in the brain. Consequently, creative expression enhances self-worth and plays a critical role in long-term mood regulation."
            }
        ]
    },
    "environmental": {
        name: "ENVIRONMENTAL",
        concepts: ["carbon footprints", "greenhouse gas emissions", "mitigate climate change", "biodiversity preservation", "sustainable agriculture", "ecological footprint", "renewable energy transition", "environmental degradation", "soil conservation", "groundwater contamination", "tailpipe emissions", "air quality indices", "textile waste pollution", "eco-friendly alternatives", "circular economies"],
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
            },
            {
                title: "Reforestation → Biodiversity Preservation",
                collocations: ["restore native woodlands", "absorb carbon dioxide", "create natural habitats", "prevent soil erosion", "support diverse ecosystems", "preserve global biodiversity"],
                steps: [
                    "Reforestation efforts",
                    "restore native woodlands",
                    "absorb atmospheric carbon dioxide",
                    "create natural habitats",
                    "prevent soil erosion",
                    "support diverse ecosystems",
                    "preserve global biodiversity"
                ],
                paragraph: "Reforestation efforts restore native woodlands, which absorb vast amounts of atmospheric carbon dioxide. This process creates critical natural habitats and prevents soil erosion during heavy rains. As a result, planting trees supports diverse ecosystems and helps preserve global biodiversity from extinction."
            },
            {
                title: "Sustainable Agriculture → Soil Conservation",
                collocations: ["adopt organic farming", "eliminate synthetic pesticides", "enrich soil nutrients", "prevent chemical runoff", "protect groundwater quality", "ensure food security"],
                steps: [
                    "Sustainable agriculture",
                    "eliminate synthetic pesticides",
                    "enrich soil nutrients",
                    "prevent chemical runoff",
                    "protect groundwater quality",
                    "ensure long-term food security"
                ],
                paragraph: "Adopting organic farming practices eliminates the dependency on synthetic pesticides, thereby enriching natural soil nutrients. This prevents toxic chemical runoff into nearby streams, which protects groundwater quality. Consequently, sustainable agriculture preserves arable land and ensures long-term food security."
            },
            {
                title: "Green Transportation → Clean Air",
                collocations: ["promote electric vehicles", "transition from combustion engines", "eliminate tailpipe emissions", "reduce urban smog", "improve public health", "mitigate global warming"],
                steps: [
                    "Promote electric vehicles",
                    "transition from combustion engines",
                    "eliminate tailpipe emissions",
                    "reduce urban smog",
                    "improve public health",
                    "mitigate global warming"
                ],
                paragraph: "Promoting electric vehicles accelerates the transition away from fossil-fuel combustion engines, thereby eliminating harmful tailpipe emissions. This reduces urban smog and improves public health in congested cities. Ultimately, adopting green transportation mitigates global warming and supports clean air initiatives."
            },
            {
                title: "Eco-Tourism → Habitat Protection",
                collocations: ["encourage responsible travel", "fund conservation projects", "discourage wildlife poaching", "provide alternative incomes", "protect fragile ecosystems", "minimize carbon footprint"],
                steps: [
                    "Eco-tourism programs",
                    "encourage responsible travel",
                    "fund conservation projects",
                    "discourage wildlife poaching",
                    "provide alternative local incomes",
                    "protect fragile ecosystems"
                ],
                paragraph: "Encouraging responsible travel through eco-tourism funds vital conservation projects in developing countries. This discourages illegal wildlife poaching by providing alternative local incomes for communities. Consequently, ecological travel protects fragile ecosystems while minimizing the carbon footprint of tourists."
            }
        ]
    },
    "economic": {
        name: "ECONOMIC",
        concepts: ["macroeconomic indicators", "economic growth stimulation", "gross domestic product", "entrepreneurial innovation", "skilled labor supply", "job creation rates", "tariff deregulation", "financial overhead costs", "market dynamics", "industrial productivity", "wealth redistribution", "generational poverty", "taxation revenues", "business startup subsidies", "labor-intensive sectors"],
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
            },
            {
                title: "Small Business Subsidies → Entrepreneurial Innovation",
                collocations: ["subsidize start-up companies", "reduce financial barriers", "foster market competition", "drive local innovation", "generate niche employment", "stimulate economic dynamism"],
                steps: [
                    "Subsidize start-up companies",
                    "reduce financial barriers for entrepreneurs",
                    "foster market competition",
                    "drive local innovation",
                    "generate niche employment",
                    "stimulate economic dynamism"
                ],
                paragraph: "Subsidizing start-up companies reduces the initial financial barriers for entrepreneurs, which fosters healthy market competition. This drives local innovation and generates niche employment opportunities. Consequently, supporting small businesses stimulates overall economic dynamism and community wealth."
            },
            {
                title: "Trade Deregulation → Global Market Expansion",
                collocations: ["lower import tariffs", "facilitate cross-border trade", "expand customer bases", "increase business revenues", "stimulate international investment", "accelerate economic integration"],
                steps: [
                    "Lower import tariffs",
                    "facilitate cross-border trade",
                    "expand customer bases",
                    "increase business revenues",
                    "stimulate international investment",
                    "accelerate economic integration"
                ],
                paragraph: "Lowering import tariffs facilitates cross-border trade, allowing domestic businesses to expand their customer bases globally. This increases business revenues and stimulates international investment in manufacturing sectors. As a result, trade deregulation accelerates economic integration and boosts national gross domestic product."
            },
            {
                title: "Vocational Training Programs → Skilled Labor Supply",
                collocations: ["fund practical apprenticeships", "bridge the skills gap", "increase employment rates", "enhance labor productivity", "attract manufacturing firms", "bolster industrial growth"],
                steps: [
                    "Fund practical apprenticeships",
                    "bridge the skills gap",
                    "increase employment rates",
                    "enhance labor productivity",
                    "attract manufacturing firms",
                    "bolster industrial growth"
                ],
                paragraph: "Funding practical apprenticeship programs bridges the skills gap in technical fields, thereby increasing youth employment rates. This enhances overall labor productivity and attracts foreign manufacturing firms. Ultimately, a steady supply of skilled technicians bolsters industrial growth and raises household incomes."
            },
            {
                title: "Green Technology Investment → Sustainable Industries",
                collocations: ["invest in clean tech", "create green jobs", "reduce manufacturing wastes", "lower energy expenses", "improve corporate sustainability", "stimulate modern industries"],
                steps: [
                    "Invest in clean technology",
                    "create green jobs",
                    "reduce manufacturing wastes",
                    "lower energy expenses",
                    "improve corporate sustainability",
                    "stimulate modern industries"
                ],
                paragraph: "Investing in clean technology creates high-paying green jobs and encourages companies to reduce manufacturing wastes. This helps lower energy expenses over time, which improves corporate sustainability. Consequently, green investments stimulate modern, future-proof industries that align with global climate goals."
            }
        ]
    },
    "technological": {
        name: "TECHNOLOGICAL",
        concepts: ["technological supremacy", "digital literacy gaps", "automated algorithms", "e-learning democratization", "virtual telemedicine", "smart grid grids", "data analytics optimization", "operational workflows", "network infrastructure", "cybersecurity protocols", "robotic process automation", "global communications", "disruptive technology", "artificial intelligence scanners", "industry-standard software"],
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
            },
            {
                title: "Telemedicine → Healthcare Accessibility",
                collocations: ["implement virtual consultations", "bypass geographical distance", "reduce hospital wait times", "diagnose mild ailments", "streamline medical resources", "provide universal healthcare"],
                steps: [
                    "Virtual consultations",
                    "bypass geographical distance",
                    "reduce hospital wait times",
                    "diagnose mild ailments",
                    "streamline medical resources",
                    "provide universal healthcare"
                ],
                paragraph: "Implementing virtual consultations allows doctors to bypass geographical distances and reach patients in remote areas. This reduces hospital wait times and helps diagnose mild ailments quickly without in-person visits. Consequently, telemedicine streamlines medical resources and moves society closer to universal healthcare access."
            },
            {
                title: "E-Learning Platforms → Democratic Education",
                collocations: ["publish educational resources online", "eliminate commuting expenses", "allow self-paced learning", "democratize academic access", "promote lifelong learning", "bridge educational inequality"],
                steps: [
                    "Publish educational resources online",
                    "eliminate commuting expenses",
                    "allow self-paced learning",
                    "democratize academic access",
                    "promote lifelong learning",
                    "bridge educational inequality"
                ],
                paragraph: "Publishing educational resources online eliminates commuting expenses and allows students to engage in self-paced learning. This helps democratize academic access for disadvantaged demographics globally. Consequently, e-learning platforms promote lifelong learning and bridge the gap of educational inequality."
            },
            {
                title: "Smart Cities → Energy Conservation",
                collocations: ["integrate smart grid sensors", "optimize electricity distribution", "reduce power line waste", "minimize carbon footprints", "enhance urban sustainability", "lower public utility costs"],
                steps: [
                    "Integrate smart grid sensors",
                    "optimize electricity distribution",
                    "reduce power line waste",
                    "minimize carbon footprints",
                    "enhance urban sustainability",
                    "lower public utility costs"
                ],
                paragraph: "Integrating smart grid sensors allows municipalities to optimize electricity distribution based on real-time demand. This reduces power line waste and minimizes the carbon footprint of city buildings. Therefore, smart cities enhance urban sustainability while lowering public utility costs for residents."
            },
            {
                title: "Data Analytics → Personalized Services",
                collocations: ["analyze consumer patterns", "identify custom preferences", "deliver tailored experiences", "maximize user engagement", "improve customer retention", "optimize marketing expenditures"],
                steps: [
                    "Analyze consumer patterns",
                    "identify custom preferences",
                    "deliver tailored experiences",
                    "maximize user engagement",
                    "improve customer retention",
                    "optimize marketing expenditures"
                ],
                paragraph: "Analyzing consumer patterns with advanced algorithms allows businesses to identify custom preferences and deliver tailored experiences. This maximizes user engagement and improves customer retention. As a result, leveraging data analytics optimizes marketing expenditures and drives corporate profits."
            }
        ]
    },
    "educational": {
        name: "EDUCATIONAL",
        concepts: ["critical thinking skills", "vocational apprentice programs", "academic burnout patterns", "educational equality", "bilingual cognitive benefits", "illiteracy eradication", "civic responsibilities", "divergent reasoning", "holistic student development", "curriculum structural mismatch", "theoretical instruction", "practical competencies", "lifelong learning habits", "intellectual autonomy", "multilingual proficiency"],
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
            },
            {
                title: "Critical Thinking Skills → Independent Problem Solving",
                collocations: ["encourage analytical debate", "evaluate conflicting arguments", "develop critical thinking", "make reasoned judgments", "avoid media manipulation", "foster intellectual independence"],
                steps: [
                    "Encourage analytical debate",
                    "evaluate conflicting arguments",
                    "develop critical thinking",
                    "make reasoned judgments",
                    "avoid media manipulation",
                    "foster intellectual independence"
                ],
                paragraph: "Encouraging analytical debate in classrooms forces students to evaluate conflicting arguments rather than memorizing facts. This develops critical thinking skills, allowing students to make reasoned judgments in daily life. Consequently, critical education helps citizens avoid media manipulation and fosters intellectual independence."
            },
            {
                title: "Inclusion of Arts → Creative Innovation",
                collocations: ["integrate creative arts", "nurture divergent thinking", "enhance emotional intelligence", "inspire out-of-the-box ideas", "complement academic studies", "promote holistic development"],
                steps: [
                    "Integrate creative arts",
                    "nurture divergent thinking",
                    "enhance emotional intelligence",
                    "inspire out-of-the-box ideas",
                    "complement academic studies",
                    "promote holistic development"
                ],
                paragraph: "Integrating creative arts into school curricula nurtures divergent thinking and enhances emotional intelligence in children. This inspires out-of-the-box ideas that complement traditional academic studies. Consequently, including arts in school promotes holistic development and prepares students for innovative careers."
            },
            {
                title: "Bilingual Education → Cognitive Flexibility",
                collocations: ["introduce foreign languages", "stimulate neurological pathways", "improve multitasking abilities", "foster cognitive flexibility", "enhance communication skills", "broaden career horizons"],
                steps: [
                    "Introduce foreign languages early",
                    "stimulate neurological pathways",
                    "improve multitasking abilities",
                    "foster cognitive flexibility",
                    "enhance communication skills",
                    "broaden career horizons"
                ],
                paragraph: "Introducing foreign languages in primary school stimulates neurological pathways and improves multitasking abilities in children. This fosters cognitive flexibility, which enhances communication skills in multicultural societies. Ultimately, bilingual education broadens career horizons and improves long-term memory."
            },
            {
                title: "Universal Primary Education → Illiteracy Eradication",
                collocations: ["subsidize primary schools", "ensure classroom access", "eradicate youth illiteracy", "promote basic numeracy", "dismantle gender inequality", "empower marginalized communities"],
                steps: [
                    "Subsidize primary schools",
                    "ensure classroom access",
                    "eradicate youth illiteracy",
                    "promote basic numeracy",
                    "dismantle gender inequality",
                    "empower marginalized communities"
                ],
                paragraph: "Subsidizing primary schools in impoverished regions ensures classroom access for every child. This is the most effective way to eradicate youth illiteracy and promote basic numeracy. As a result, universal education dismantles gender inequality, empowers marginalized communities, and reduces global poverty."
            },
            {
                title: "Civic Education → Social Responsibility",
                collocations: ["teach civic rights", "understand democratic processes", "appreciate public services", "foster social responsibility", "encourage voting participation", "build active citizens"],
                steps: [
                    "Teach civic rights and duties",
                    "understand democratic processes",
                    "appreciate public services",
                    "foster social responsibility",
                    "encourage voting participation",
                    "build active citizens"
                ],
                paragraph: "Teaching civic rights and duties helps students understand democratic processes and appreciate public services. This fosters social responsibility, encouraging active voting participation when they reach adulthood. Ultimately, civic education builds active citizens who contribute positively to their communities."
            }
        ]
    },
    "health": {
        name: "HEALTH & MEDICAL",
        concepts: ["preventive healthcare measures", "chronic disease incidence", "sedentary lifestyle risks", "cardiovascular fitness", "nutritional literacy", "sugar taxation models", "obesity rate spikes", "mental health stigmatization", "waterborne pathogen removal", "sleep hygiene practices", "circadian rhythm regulation", "longevity indices", "healthcare expenditure budgets", "medical diagnostic efficacy", "immunological strength"],
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
            },
            {
                title: "Sugar Taxation → Reduced Obesity Rates",
                collocations: ["impose sugar taxes", "inflate soft drink prices", "discourage unhealthy purchases", "reduce sugar intake", "lower childhood obesity rates", "prevent chronic illnesses"],
                steps: [
                    "Impose sugar taxes",
                    "inflate soft drink prices",
                    "discourage unhealthy purchases",
                    "reduce daily sugar intake",
                    "lower childhood obesity rates",
                    "prevent chronic illnesses"
                ],
                paragraph: "Imposing sugar taxes on processed products artificially inflates soft drink prices, discouraging unhealthy purchases by consumers. This reduces daily sugar intake, leading to lower childhood obesity rates. Consequently, fiscal healthcare policies help prevent chronic illnesses like diabetes and heart disease."
            },
            {
                title: "Physical Education → Cardio Fitness",
                collocations: ["mandate physical education", "promote daily movement", "improve cardiovascular fitness", "burn excess calories", "prevent sedentary diseases", "foster lifetime fitness habits"],
                steps: [
                    "Mandate physical education",
                    "promote daily movement",
                    "improve cardiovascular fitness",
                    "burn excess calories",
                    "prevent sedentary diseases",
                    "foster lifetime fitness habits"
                ],
                paragraph: "Mandating daily physical education in schools promotes movement and improves cardiovascular fitness among children. This burns excess calories, which is essential to prevent sedentary diseases like obesity. Ultimately, school sports programs foster lifetime fitness habits and support physical health."
            },
            {
                title: "Mental Health Campaigns → Reduced Social Stigma",
                collocations: ["fund public mental health campaigns", "increase psychological literacy", "dismantle social stigma", "encourage seeking help", "reduce depression rates", "improve public well-being"],
                steps: [
                    "Fund public mental health campaigns",
                    "increase psychological literacy",
                    "dismantle social stigma",
                    "encourage seeking help early",
                    "reduce depression rates",
                    "improve public well-being"
                ],
                paragraph: "Funding public mental health campaigns increases psychological literacy, helping to dismantle social stigma surrounding counseling. This encourages citizens to seek help early when experiencing distress, reducing chronic depression rates. As a result, public awareness drives improve the overall well-being of communities."
            },
            {
                title: "Clean Water Initiatives → Disease Prevention",
                collocations: ["install water filtration", "eliminate waterborne pathogens", "prevent cholera outbreaks", "improve sanitation standards", "reduce infant mortality", "support public hygiene"],
                steps: [
                    "Install water filtration infrastructure",
                    "eliminate waterborne pathogens",
                    "prevent cholera outbreaks",
                    "improve sanitation standards",
                    "reduce infant mortality",
                    "support public hygiene"
                ],
                paragraph: "Installing clean water filtration infrastructure eliminates waterborne pathogens in rural areas. This directly prevents cholera outbreaks and improves local sanitation standards. Consequently, access to clean water reduces infant mortality rates and supports the baseline public hygiene of developing nations."
            },
            {
                title: "Sleep Hygiene Education → Sleep Quality",
                collocations: ["teach sleep hygiene", "regulate circadian rhythms", "improve sleep quality", "boost immune systems", "enhance daytime productivity", "promote physical health"],
                steps: [
                    "Teach sleep hygiene practices",
                    "regulate circadian rhythms",
                    "improve sleep quality",
                    "boost immune systems",
                    "enhance daytime productivity",
                    "promote physical health"
                ],
                paragraph: "Teaching sleep hygiene practices helps individuals regulate circadian rhythms and improve sleep quality. Better rest boosts immune systems, which enhances daytime productivity and focus. Therefore, educating the public on sleep hygiene is a simple yet powerful way to promote long-term physical health."
            }
        ]
    },
    "social": {
        name: "SOCIAL",
        concepts: ["upward social mobility", "community cohesion rates", "neighborhood trust levels", "juvenile delinquency drops", "inclusive hiring protocols", "generational divides", "social isolation risks", "disabled universal accessibility", "marginalized communities", "civic engagement habits", "welfare safety nets", "community volunteering programs", "socioeconomic disparities", "societal integration", "equal opportunity acts"],
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
            },
            {
                title: "Public Parks → Community Cohesion",
                collocations: ["construct green public parks", "provide free recreational spaces", "encourage outdoor interactions", "facilitate community events", "foster neighborhood trust", "improve community cohesion"],
                steps: [
                    "Construct green public parks",
                    "provide free recreational spaces",
                    "encourage outdoor interactions",
                    "facilitate community events",
                    "foster neighborhood trust",
                    "improve community cohesion"
                ],
                paragraph: "Constructing green public parks provides free recreational spaces that encourage outdoor interactions among diverse groups. This facilitates local community events and helps foster neighborhood trust. Consequently, green urban planning is highly effective at improving community cohesion and reducing crime."
            },
            {
                title: "Youth Clubs → Decreased Delinquency",
                collocations: ["fund youth sports clubs", "occupy adolescents' free time", "teach discipline and teamwork", "discourage anti-social behaviors", "reduce juvenile delinquency", "promote safe environments"],
                steps: [
                    "Fund youth sports clubs",
                    "occupy adolescents' free time",
                    "teach discipline and teamwork",
                    "discourage anti-social behaviors",
                    "reduce juvenile delinquency",
                    "promote safe environments"
                ],
                paragraph: "Funding youth sports clubs occupies adolescents' free time with positive, structured activities that teach discipline and teamwork. This discourages anti-social behaviors and reduces juvenile delinquency in high-risk neighborhoods. As a result, local investments build safer environments for families."
            },
            {
                title: "Inclusive Workplaces → Social Mobility",
                collocations: ["promote inclusive hiring", "dismantle corporate glass ceilings", "empower marginalized demographics", "increase household incomes", "support social mobility", "reduce wealth inequality"],
                steps: [
                    "Promote inclusive hiring practices",
                    "dismantle corporate glass ceilings",
                    "empower marginalized demographics",
                    "increase household incomes",
                    "support social mobility",
                    "reduce wealth inequality"
                ],
                paragraph: "Promoting inclusive hiring practices helps dismantle corporate glass ceilings and empowers marginalized demographics to build careers. This increases household incomes, thereby supporting upward social mobility. Ultimately, equal employment opportunities reduce systemic wealth inequality and foster social justice."
            },
            {
                title: "Volunteering Programs → Social Integration",
                collocations: ["organize community volunteering", "connect diverse demographics", "bridge generational divides", "foster mutual understanding", "reduce social isolation", "strengthen support networks"],
                steps: [
                    "Organize community volunteering",
                    "connect diverse demographics",
                    "bridge generational divides",
                    "foster mutual understanding",
                    "reduce social isolation",
                    "strengthen support networks"
                ],
                paragraph: "Organizing community volunteering connects diverse demographics who would otherwise never interact. This bridges generational divides and fosters mutual understanding among residents. Consequently, public volunteering programs reduce social isolation and strengthen local support networks."
            },
            {
                title: "Universal Design → Accessibility",
                collocations: ["implement universal design", "install ramps and elevators", "enable independent mobility", "support disabled citizens", "promote social inclusion", "guarantee equal access"],
                steps: [
                    "Implement universal design principles",
                    "install ramps and elevators",
                    "enable independent mobility",
                    "support disabled citizens",
                    "promote social inclusion",
                    "guarantee equal access"
                ],
                paragraph: "Implementing universal design principles in architecture forces builders to install ramps and elevators. This enables independent mobility for disabled citizens, allowing them to navigate spaces without assistance. Therefore, structural accessibility changes promote social inclusion and guarantee equal access to public life."
            }
        ]
    },
    "cultural": {
        name: "CULTURAL",
        concepts: ["cultural homogenization", "indigenous heritage revival", "intercultural harmony", "historical preservation", "preconceived racial stereotypes", "globalized perspective", "multicultural celebrations", "linguistic diversity conservation", "museum admission access", "foreign exchange programs", "peaceful diplomacy ties", "ethnic heritage restoration", "ancestral wisdom conservation", "cross-cultural tolerance", "artistic legacy values"],
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
            },
            {
                title: "Heritage Preservation → Cultural Identity",
                collocations: ["restore historical monuments", "protect traditional crafts", "preserve cultural identity", "pass down oral histories", "foster national pride", "combat cultural homogenization"],
                steps: [
                    "Restore historical monuments",
                    "protect traditional crafts",
                    "preserve cultural identity",
                    "pass down oral histories",
                    "foster national pride",
                    "combat cultural homogenization"
                ],
                paragraph: "Restoring historical monuments and protecting traditional crafts helps communities preserve their unique cultural identity. This allows elders to pass down oral histories to younger generations, fostering a strong sense of national pride. Consequently, active heritage preservation combats cultural homogenization in a globalized world."
            },
            {
                title: "Cultural Festivals → Intercultural Harmony",
                collocations: ["sponsor multicultural festivals", "celebrate ethnic diversity", "showcase traditional arts", "promote mutual respect", "foster intercultural harmony", "dismantle racial prejudices"],
                steps: [
                    "Sponsor multicultural festivals",
                    "celebrate ethnic diversity",
                    "showcase traditional arts",
                    "promote mutual respect",
                    "foster intercultural harmony",
                    "dismantle racial prejudices"
                ],
                paragraph: "Sponsoring multicultural festivals celebrates ethnic diversity and showcases traditional arts within a city. This promotes mutual respect among different ethnic groups and fosters intercultural harmony. As a result, public cultural events are essential tools to dismantle racial prejudices and build tolerant societies."
            },
            {
                title: "Language Revitalization → Indigenous Heritage",
                collocations: ["fund language immersion programs", "teach endangered languages", "revitalize ancestral wisdom", "strengthen community identity", "preserve indigenous heritage", "enrich linguistic diversity"],
                steps: [
                    "Fund language immersion programs",
                    "teach endangered languages in schools",
                    "revitalize ancestral wisdom",
                    "strengthen community identity",
                    "preserve indigenous heritage",
                    "enrich linguistic diversity"
                ],
                paragraph: "Funding language immersion programs allows educators to teach endangered languages to young children. This revitalizes ancestral wisdom and strengthens community identity in indigenous regions. Ultimately, language preservation protects precious heritage and enriches global linguistic diversity."
            },
            {
                title: "Museum Subsidies → Public Education",
                collocations: ["subsidize historical museums", "offer free admission", "increase cultural literacy", "educate children on historical events", "foster scientific curiosity", "promote national heritage"],
                steps: [
                    "Subsidize historical museums",
                    "offer free public admission",
                    "increase cultural literacy",
                    "educate children on historical events",
                    "foster scientific curiosity",
                    "promote national heritage"
                ],
                paragraph: "Subsidizing historical museums allows them to offer free public admission, drastically increasing cultural literacy among families. This helps educate children on historical events and fosters scientific curiosity outside the classroom. Therefore, museum subsidies are key investments in promoting national heritage and public education."
            },
            {
                title: "Global Exchange Programs → International Collaboration",
                collocations: ["sponsor student exchange programs", "expose scholars to different perspectives", "foster international friendships", "facilitate joint research", "solve global challenges", "promote peaceful diplomacy"],
                steps: [
                    "Sponsor student exchange programs",
                    "expose scholars to different perspectives",
                    "foster international friendships",
                    "facilitate joint research",
                    "solve global challenges",
                    "promote peaceful diplomacy"
                ],
                paragraph: "Sponsoring student exchange programs exposes young scholars to different educational perspectives, fostering lifelong international friendships. These networks later facilitate joint research and collaborative business ventures. Consequently, global exchanges help solve transnational challenges and promote peaceful diplomacy."
            }
        ]
    },
    "government": {
        name: "GOVERNMENT & POLICY",
        concepts: ["sweeping legislative power", "fiscal policy controls", "punitive financial fines", "industrial safety compliance", "welfare payout benefits", "public works infrastructure", "mandatory product labeling", "excise tax implementations", "environmental regulations", "corporate accountability laws", "government subsidies", "public fund allocation", "housing rent subsidies", "social safety nets", "statutory retirement laws"],
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
            },
            {
                title: "Subsidies → Clean Energy Adoption",
                collocations: ["subsidize solar panels", "lower purchase costs", "encourage residential installation", "reduce electric grid demand", "cut carbon footprints", "accelerate energy transition"],
                steps: [
                    "Subsidize solar panels",
                    "lower purchase costs for families",
                    "encourage residential installation",
                    "reduce electric grid demand",
                    "cut carbon footprints",
                    "accelerate energy transition"
                ],
                paragraph: "Subsidizing solar panels lowers the initial purchase costs for households, encouraging residential installations. This reduces demand on the national electric grid and cuts carbon footprints at the neighborhood level. Consequently, government financial incentives successfully accelerate the transition to clean energy."
            },
            {
                title: "Fines → Industrial Regulation",
                collocations: ["impose heavy fines on polluters", "enforce strict environmental laws", "discourage illegal waste dumping", "force corporate compliance", "protect local ecosystems", "improve corporate responsibility"],
                steps: [
                    "Impose heavy fines on polluters",
                    "enforce strict environmental laws",
                    "discourage illegal waste dumping",
                    "force corporate compliance",
                    "protect local ecosystems",
                    "improve corporate responsibility"
                ],
                paragraph: "Imposing heavy fines on industrial polluters enforces strict environmental laws and discourages illegal waste dumping in rivers. This forces corporate compliance with safety regulations, thereby protecting local ecosystems. Ultimately, punitive regulations improve corporate responsibility and shield communities from pollution."
            },
            {
                title: "Welfare Benefits → Reduced Poverty Rates",
                collocations: ["distribute monthly social security", "eliminate absolute poverty", "secure access to nutrition", "improve health outcomes", "boost local economies", "promote social security"],
                steps: [
                    "Distribute monthly social security benefits",
                    "eliminate absolute poverty",
                    "secure access to basic nutrition",
                    "improve health outcomes",
                    "boost local economies",
                    "promote social security"
                ],
                paragraph: "Distributing monthly social security benefits directly to low-income families helps eliminate absolute poverty. This guarantees secure access to basic nutrition and housing, which improves health outcomes. As a result, financial welfare cushions boost local economies by increasing the spending power of citizens."
            },
            {
                title: "Public Infrastructure Funding → Traffic Reduction",
                collocations: ["allocate funds to railways", "expand public transit", "provide commuting alternatives", "discourage car dependence", "reduce traffic congestion", "improve commute times"],
                steps: [
                    "Allocate funds to railways",
                    "expand public transit infrastructure",
                    "provide commuting alternatives",
                    "discourage car dependence",
                    "reduce traffic congestion",
                    "improve commute times"
                ],
                paragraph: "Allocating public funds to expand railway networks provides citizens with reliable commuting alternatives. This discourages car dependence in growing metropolitan zones, thereby reducing traffic congestion. Consequently, government infrastructure investments improve daily commute times and decrease air pollution."
            },
            {
                title: "Mandatory Labeling → Consumer Awareness",
                collocations: ["mandate nutrition labeling", "display sugar content clearly", "inform consumer purchases", "promote healthier diets", "discourage junk food buying", "reduce obesity rates"],
                steps: [
                    "Mandate nutrition labeling",
                    "display sugar and fat contents clearly",
                    "inform consumer purchases",
                    "promote healthier diets",
                    "discourage junk food buying",
                    "reduce obesity rates"
                ],
                paragraph: "Mandating clear nutrition labeling on food packages displays sugar and fat contents clearly at the point of sale. This informs consumer purchases and promotes healthier diets among families. As a result, mandatory labeling regulations discourage junk food buying and play a role in reducing obesity rates."
            }
        ]
    },
    "infrastructure": {
        name: "INFRASTRUCTURE",
        concepts: ["urban gridlock management", "mass transit infrastructure", "affordable public housing", "pedestrianized retail zones", "dedicated bicycle lanes", "renewable grid systems", "sewage treatment networks", "utility supply grids", "commute time reduction", "traffic volume drops", "housing shortage solutions", "sustainable city models", "waste management facilities", "energy independence indices", "municipal structural upgrades"],
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
            },
            {
                title: "Bicycle Lanes → Sustainable Commuting",
                collocations: ["construct dedicated bicycle lanes", "ensure cyclist safety", "encourage cycling over driving", "reduce traffic volumes", "improve air quality", "promote physical fitness"],
                steps: [
                    "Construct dedicated bicycle lanes",
                    "ensure cyclist safety",
                    "encourage cycling over driving",
                    "reduce traffic volumes",
                    "improve air quality",
                    "promote physical fitness"
                ],
                paragraph: "Constructing dedicated bicycle lanes ensures cyclist safety and encourages citizens to cycle instead of driving. This reduces traffic volumes in city centers, thereby improving local air quality. Consequently, cycle infrastructure supports sustainable commuting while promoting physical fitness among residents."
            },
            {
                title: "Affordable Housing → Reduced Homelessness",
                collocations: ["build affordable public housing", "subsidize rent expenses", "secure shelter for low-income families", "reduce street homelessness", "stabilize households", "support social welfare"],
                steps: [
                    "Build affordable public housing",
                    "subsidize rent expenses",
                    "secure shelter for low-income families",
                    "reduce street homelessness",
                    "stabilize households",
                    "support social welfare"
                ],
                paragraph: "Building affordable public housing and subsidizing rent expenses secures shelter for low-income families. This directly reduces street homelessness, providing a stable environment where children can study. Ultimately, housing infrastructure projects stabilize vulnerable households and support overall social welfare."
            },
            {
                title: "Pedestrian Zones → Retail Growth",
                collocations: ["pedestrianize shopping streets", "eliminate vehicle traffic", "create safe walking spaces", "encourage window shopping", "boost local retail sales", "promote city tourism"],
                steps: [
                    "Pedestrianize shopping streets",
                    "eliminate vehicle traffic",
                    "create safe walking spaces",
                    "encourage window shopping",
                    "boost local retail sales",
                    "promote city tourism"
                ],
                paragraph: "Pedestrianizing downtown shopping streets eliminates vehicle traffic and creates safe walking spaces for families. This encourages window shopping and boosts local retail sales as pedestrian foot traffic increases. Consequently, pedestrian infrastructure revitalizes city centers and promotes tourism."
            },
            {
                title: "Renewable Grids → Energy Independence",
                collocations: ["construct wind turbines", "integrate clean energy grids", "reduce fossil fuel imports", "lower national energy bills", "secure power grids", "combat climate change"],
                steps: [
                    "Construct wind turbines",
                    "integrate clean energy grids",
                    "reduce fossil fuel imports",
                    "lower national energy bills",
                    "secure power grids",
                    "combat climate change"
                ],
                paragraph: "Constructing wind turbines and integrating clean energy grids reduces a nation's dependence on foreign fossil fuel imports. This lowers national energy bills and secures the power grid against resource shortages. As a result, renewable infrastructure supports energy independence while helping to combat global climate change."
            },
            {
                title: "Waste Management Systems → Environmental Protection",
                collocations: ["upgrade waste management systems", "implement organic composting", "divert trash from landfills", "reduce methane emissions", "prevent soil contamination", "support circular economies"],
                steps: [
                    "Upgrade waste management systems",
                    "implement organic composting",
                    "divert trash from landfills",
                    "reduce methane emissions",
                    "prevent soil contamination",
                    "support circular economies"
                ],
                paragraph: "Upgrading municipal waste management systems allows cities to implement organic composting programs. This diverts trash from landfills, reducing harmful methane emissions. Ultimately, advanced waste infrastructure prevents soil contamination and supports sustainable, circular economies."
            }
        ]
    },
    "consumerism": {
        name: "CONSUMERISM",
        concepts: ["throwaway convenience culture", "fast fashion wastes", "ethical consumer choices", "mass advertising influence", "impulse spending triggers", "local shopping campaigns", "minimalist lifestyle benefits", "single-use plastic bans", "corporate greenwashing", "biodegradable raw materials", "household clutter reduction", "personal debt accumulation", "unsustainable packaging", "brand loyalty marketing", "consumer demand dynamics"],
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
            },
            {
                title: "Mass Advertising → Emotional Unsatisfaction",
                collocations: ["manufacture consumer desires", "promote luxury lifestyles", "foster feelings of inadequacy", "drive impulsive spending", "accumulate personal debt", "cause psychological stress"],
                steps: [
                    "Manufacture consumer desires",
                    "promote luxury lifestyles in advertisements",
                    "foster feelings of inadequacy",
                    "drive impulsive spending",
                    "accumulate personal debt",
                    "cause psychological stress"
                ],
                paragraph: "Mass advertising manufactures consumer desires by constantly promoting luxury lifestyles. This fosters feelings of inadequacy among citizens who cannot afford these goods, driving impulsive spending. As a result, consumers accumulate personal debt, causing severe psychological stress and dissatisfaction."
            },
            {
                title: "Fast Fashion → Environmental Destruction",
                collocations: ["produce cheap synthetic clothing", "encourage throwaway fashion", "increase textile waste", "pollute water systems", "skyrocket carbon emissions", "deplete raw resources"],
                steps: [
                    "Produce cheap synthetic clothing",
                    "encourage throwaway fashion habits",
                    "increase textile waste in landfills",
                    "pollute water systems",
                    "skyrocket carbon emissions",
                    "deplete raw resources"
                ],
                paragraph: "The fast fashion industry produces cheap synthetic clothing, encouraging a throwaway culture where garments are discarded after few wears. This increases textile waste in landfills and pollutes water systems with microplastics. Ultimately, cheap manufacturing habits skyrocket carbon emissions and deplete raw resources."
            },
            {
                title: "Buy Local Campaigns → Regional Prosperity",
                collocations: ["support local businesses", "keep capital in communities", "create regional jobs", "reduce transportation emissions", "foster community relations", "strengthen regional economies"],
                steps: [
                    "Support local businesses",
                    "keep capital inside communities",
                    "create regional jobs",
                    "reduce transportation emissions",
                    "foster community relations",
                    "strengthen regional economies"
                ],
                paragraph: "Buying local encourages citizens to support independent neighborhood businesses, keeping capital inside the community. This creates regional jobs and reduces transportation emissions by minimizing shipping distances. Consequently, buy local campaigns foster community relations and strengthen regional economies."
            },
            {
                title: "Minimalist Lifestyles → Financial Freedom",
                collocations: ["embrace minimalist lifestyles", "curb impulse buying", "reduce household clutter", "increase monthly savings", "achieve financial freedom", "reduce carbon footprints"],
                steps: [
                    "Embrace minimalist lifestyles",
                    "curb impulse buying",
                    "reduce household clutter",
                    "increase monthly savings",
                    "achieve financial freedom",
                    "reduce carbon footprints"
                ],
                paragraph: "Embracing minimalist lifestyles helps individuals curb impulse buying and reduce household clutter. This significantly increases monthly savings, allowing families to achieve financial freedom and avoid debt. Ultimately, buying less reduces personal carbon footprints and encourages mindful living."
            },
            {
                title: "Single-Use Bans → Plastic Waste Reduction",
                collocations: ["ban single-use plastics", "promote reusable bags", "reduce plastic bag usage", "minimize marine pollution", "protect aquatic wildlife", "encourage green behaviors"],
                steps: [
                    "Ban single-use plastics",
                    "promote reusable shopping bags",
                    "reduce plastic bag usage",
                    "minimize marine pollution",
                    "protect aquatic wildlife",
                    "encourage green behaviors"
                ],
                paragraph: "Banning single-use plastic cups and straws forces supermarkets to promote reusable shopping bags. This reduces plastic bag usage and minimizes marine pollution in coastal zones. Consequently, single-use bans protect aquatic wildlife and encourage green behaviors among the public."
            }
        ]
    }
};

function extractArchitecture(paragraph) {
    if (!paragraph) return [];
    const patterns = [
        { name: "Because", regex: /\bbecause\b/i },
        { name: "This is because", regex: /\bthis is because\b/i },
        { name: "One of the main reasons", regex: /\bone of the main reasons\b/i },
        { name: "Since / As", regex: /\b(since|as)\b/i },
        { name: "Owing to / Due to", regex: /\b(owing to|due to)\b/i },
        { name: "On the grounds that", regex: /\bon the grounds that\b/i },
        { name: "by + Verb-ing", regex: /\bby\s+\w+ing\b/i },
        { name: "through", regex: /\bthrough\b/i },
        { name: "via", regex: /\bvia\b/i },
        { name: "By means of", regex: /\bby means of\b/i },
        { name: "With the aid of", regex: /\bwith the aid of\b/i },
        { name: "Through the implementation", regex: /\bthrough the implementation\b/i },
        { name: "By leveraging", regex: /\bby leveraging\b/i },
        { name: "As a result", regex: /\bas a result\b/i },
        { name: "Consequently", regex: /\bconsequently\b/i },
        { name: "Therefore", regex: /\btherefore\b/i },
        { name: "Thus / Hence", regex: /\b(thus|hence)\b/i },
        { name: "As a direct consequence", regex: /\bas a direct consequence\b/i },
        { name: "Which in turn leads to", regex: /\bwhich in turn leads to\b/i },
        { name: "Thereby + Verb-ing", regex: /\bthereby\s+\w+ing\b/i },
        { name: "With the result that", regex: /\bwith the result that\b/i },
        { name: "allowing (Participle)", regex: /\ballowing\b/i },
        { name: "leading to (Participle)", regex: /\bleading to\b/i },
        { name: "resulting in (Participle)", regex: /\bresulting in\b/i },
        { name: "preventing (Participle)", regex: /\bpreventing\b/i },
        { name: "fostering (Participle)", regex: /\bfostering\b/i },
        { name: "minimizing (Participle)", regex: /\bminimizing\b/i },
        { name: "ensuring (Participle)", regex: /\bensuring\b/i },
        { name: "Although", regex: /\balthough\b/i },
        { name: "While", regex: /\bwhile\b/i },
        { name: "Even though", regex: /\beven though\b/i },
        { name: "Despite / In spite of", regex: /\b(despite|in spite of)\b/i },
        { name: "Nonetheless / Nevertheless", regex: /\b(nonetheless|nevertheless)\b/i }
    ];
    
    let found = [];
    patterns.forEach(p => {
        if (p.regex.test(paragraph)) {
            found.push(p.name);
        }
    });
    return found;
}

// Automatically extract sentence architecture for each lens chain
Object.keys(lensesData).forEach(lensKey => {
    lensesData[lensKey].chains.forEach(chain => {
        chain.architecture = extractArchitecture(chain.paragraph);
    });
});

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
                        { pattern: "One of the main reasons is that", formula: "One of the main reasons is that...", purpose: "Strong academic explanation", example: "One of the main reasons saving money is beneficial is that it builds financial security." },
                        { pattern: "Since / As", formula: "Since / As + clause, main clause", purpose: "Establish context/reason at start of sentence", example: "Since tuition fees have risen dramatically, many students are forced to take loans." },
                        { pattern: "Owing to / Due to the fact that", formula: "Due to / Owing to + noun OR the fact that + clause", purpose: "Formal attribution of cause", example: "Unpaid internships are popular owing to the fact that they offer resume padding." },
                        { pattern: "A key catalyst for this is...", formula: "Sentence. A key catalyst for this is + noun phrase", purpose: "Describe trigger/driver of a trend", example: "Obesity rates are surging among youth. A key catalyst for this is the normalization of sedentary lifestyles." },
                        { pattern: "On the grounds that", formula: "S + V + on the grounds that + clause", purpose: "Provide justification/grounds for an action", example: "Governments should subsidize solar energy on the grounds that it mitigates climate change." }
                    ]
                },
                {
                    name: "FAMILY 2 — MECHANISM",
                    items: [
                        { pattern: "by + Verb-ing", formula: "S + V + by + V-ing", purpose: "Explain how", example: "Exercise improves health by strengthening muscles." },
                        { pattern: "through + Noun / V-ing", formula: "through...", purpose: "Explain process", example: "Students learn through interacting with others." },
                        { pattern: "via + Noun / V-ing", formula: "S + V + via + noun phrase", purpose: "Specify the medium or channel", example: "Supermarkets deliver coffee packages directly to retail shelves via supply trucks." },
                        { pattern: "By means of", formula: "S + V + by means of + noun phrase / V-ing", purpose: "Formal explanation of instrument", example: "Governments manipulate consumer behavior by means of high excise taxes on alcohol." },
                        { pattern: "With the aid of", formula: "With the aid of + noun phrase, S + V", purpose: "Indicate tools or assistance used", example: "With the aid of diagnostic AI software, doctors can identify early-stage tumors." },
                        { pattern: "Through the implementation of", formula: "S + V + through the implementation of + noun", purpose: "Describe process driven by a policy", example: "Firms can streamline operational workflows through the implementation of automation systems." },
                        { pattern: "By leveraging", formula: "By leveraging + noun phrase, S + V", purpose: "Explain utilization of assets/advantages", example: "By leveraging their immense commercial popularity, elite athletes secure lucrative sponsorships." }
                    ]
                },
                {
                    name: "FAMILY 3 — RESULTS",
                    items: [
                        { pattern: "As a result", formula: "As a result...", purpose: "Immediate consequence", example: "People save money. As a result, they avoid debt." },
                        { pattern: "Consequently", formula: "Consequently,...", purpose: "Long-term consequence", example: "Students practise regularly. Consequently, they become more employable." },
                        { pattern: "Therefore", formula: "Therefore,...", purpose: "Conclude argument", example: "Therefore, everyone should exercise regularly." },
                        { pattern: "Thus / Hence", formula: "Sentence; thus / hence, S + V OR S + V, thus + V-ing", purpose: "Formal logical deduction", example: "Tuition costs have skyrocketed; hence, students accumulate substantial debt." },
                        { pattern: "As a direct consequence of this", formula: "Sentence. As a direct consequence of this, S + V", purpose: "Establish strong causal link", example: "Factories dump chemical waste in rivers. As a direct consequence of this, local ecosystems are destroyed." },
                        { pattern: "Which in turn leads to", formula: "S + V, which in turn + V (present/future) / leads to + noun", purpose: "Chain reaction / secondary consequence", example: "Renewable energy lowers carbon emissions, which in turn mitigates climate change." },
                        { pattern: "Thereby + Verb-ing", formula: "S + V, thereby + V-ing + object", purpose: "Show immediate automatic result", example: "Automation handles repetitive administrative tasks, thereby maximizing corporate efficiency." },
                        { pattern: "With the result that", formula: "S + V + with the result that + clause", purpose: "Formal statement of final outcome", example: "The government increased mandatory physical activity in schools, with the result that childhood obesity rates dropped." }
                    ]
                },
                {
                    name: "FAMILY 4 — PARTICIPLE CLAUSES (Compression)",
                    items: [
                        { pattern: "allowing...", formula: ", allowing...", purpose: "Gives opportunity", example: "Technology provides resources, allowing students to study independently." },
                        { pattern: "leading to...", formula: ", leading to...", purpose: "Next consequence", example: "Exercise strengthens muscles, leading to better health." },
                        { pattern: "resulting in...", formula: ", resulting in...", purpose: "Formal consequence", example: "Investment improves schools, resulting in better education." },
                        { pattern: "preventing...", formula: ", preventing + noun / V-ing", purpose: "Describe a negative outcome being blocked", example: "A gap year builds independence, preventing graduates from feeling overwhelmed at university." },
                        { pattern: "fostering...", formula: ", fostering + noun phrase", purpose: "Show the development of a positive quality", example: "Group projects encourage communication, fostering team spirit among classmates." },
                        { pattern: "minimizing...", formula: ", minimizing + noun phrase", purpose: "Show reduction of risk/cost/waste", example: "The software detects layout errors early, minimizing manufacturing waste." },
                        { pattern: "ensuring...", formula: ", ensuring + that + clause / noun", purpose: "Describe guaranteed outcomes", example: "The city pedestrianized shopping zones, ensuring the safety of local residents." }
                    ]
                },
                {
                    name: "FAMILY 5 — CONCESSION & BALANCING",
                    items: [
                        { pattern: "Although", formula: "Although...", purpose: "Admit drawback", example: "Although studying abroad is expensive, it offers valuable experiences." },
                        { pattern: "While", formula: "While...", purpose: "Contrast", example: "While technology offers convenience, it may reduce face-to-face interaction." },
                        { pattern: "Even though", formula: "Even though + clause, main clause", purpose: "Strong concession", example: "Even though space exploration yields scientific data, it remains an expensive luxury." },
                        { pattern: "Despite / In spite of", formula: "Despite / In spite of + noun phrase / V-ing, S + V", purpose: "Concession using noun phrases", example: "Despite the massive financial costs of restoration, historical buildings must be preserved." },
                        { pattern: "Nonetheless / Nevertheless", formula: "Sentence. Nonetheless / Nevertheless, S + V", purpose: "Adversative transition between sentences", example: "Remote work increases flexibility. Nonetheless, it can lead to intense social isolation." },
                        { pattern: "Granted that", formula: "Granted that + clause, S + V", purpose: "Concede a point before establishing a counterpoint", example: "Granted that zoos confine wild animals, they are essential for breeding endangered species." },
                        { pattern: "Albeit", formula: "S + V + albeit + adjective/adverb/noun phrase", purpose: "Concede a minor point compactly", example: "The government raised the retirement age, achieving economic benefits, albeit unpopular ones." }
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
