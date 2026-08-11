document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const contentBody = document.getElementById('content-body');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const themeToggle = document.getElementById('theme-toggle');
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.querySelector('.sidebar');

    // Sidebar Toggle Logic
    sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
    });

    // Helper to format essays cleanly into HTML paragraphs
    function formatEssay(text) {
        if (!text) return '';
        return text.split(/\n\n+/).map(p => p.trim()).filter(p => p)
            .map(p => `<p style="margin-bottom: 12px; line-height: 1.6; margin-top: 4px;">${p.replace(/\n/g, '<br/>')}</p>`).join('');
    }

    // Theme Toggle Logic
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const icon = themeToggle.querySelector('i');
        if (document.body.classList.contains('dark-mode')) {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i> Toggle Light Mode';
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i> Toggle Dark Mode';
        }
    });

    // Navigation Logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            // Remove active class from all
            navItems.forEach(nav => nav.classList.remove('active'));
            // Add active class to clicked
            e.currentTarget.classList.add('active');
            
            const target = e.currentTarget.getAttribute('data-target');
            loadContent(target);
        });
    });

    // Initial Load
    loadContent('task1-line');

    function loadContent(target) {
        contentBody.innerHTML = ''; // Clear current content
        contentBody.classList.remove('animate-fade-in');
        
        // Trigger reflow
        void contentBody.offsetWidth;
        contentBody.classList.add('animate-fade-in');

        const data = window.ieltsData;
        if (!data) {
            contentBody.innerHTML = '<p>Data loading error...</p>';
            return;
        }

        if (target.startsWith('task1-')) {
            const chartType = target.split('-')[1];
            renderTask1(data.task1[chartType]);
        } else if (target === 'task2-playbook') {
            renderPlaybook(data.task2.playbook);
        } else if (target === 'task2-lenses') {
            renderLenses(data.task2.lenses);
        } else if (target.startsWith('lens-')) {
            const lensType = target.split('-')[1];
            renderSingleLens(data.task2.lenses[lensType], lensType);
        } else if (target.startsWith('task2-')) {
            const essayType = target.split('-')[1];
            renderTask2Essays(data.task2.essays[essayType]);
        } else if (target === 'speaking-hub') {
            renderSpeaking();
        }
    }

    function renderTask1(data) {
        if(!data) return;
        pageTitle.innerText = data.title;
        pageSubtitle.innerText = data.subtitle;

        let html = `<div class="card">
            <h3>Core Strategy</h3>
            <ul>${data.strategy.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>`;

        data.examples.forEach((ex, index) => {
            html += `
            <div class="card">
                <h3>Example ${index + 1}: ${ex.title}</h3>
                <div class="prompt"><strong>PROMPT:</strong> ${ex.prompt}</div>`;
                
            if (ex.figureUrl) {
                html += `
                <div style="margin: 20px 0; height: 500px; overflow: hidden; border: 1px solid var(--border-color); border-radius: 8px; background: #ffffff;">
                    <iframe src="IELTS_Prep/Figures/Individual/${ex.figureUrl}" scrolling="no" style="width: 100%; height: 100%; border: none; overflow: hidden;"></iframe>
                </div>
                <div class="blueprint-box" style="margin: 20px 0;">
                    <strong>PLANNING NOTE:</strong><br/>
                    ${ex.planning.map(p => `<div>${p}</div>`).join('')}
                </div>`;
            } else {
                html += `
                <div class="blueprint-box" style="margin: 20px 0;">
                    <strong>PLANNING NOTE:</strong><br/>
                    ${ex.planning.map(p => `<div>${p}</div>`).join('')}
                </div>`;
            }

            html += `
                <div class="essay-text">
                    <strong style="display:block; margin-bottom: 8px;">BAND 9 ESSAY:</strong>
                    ${formatEssay(ex.essay)}
                </div>
            </div>`;
        });

        contentBody.innerHTML = html;
    }

    function renderPlaybook(data) {
        if(!data) return;
        pageTitle.innerText = "Grammar Playbook";
        pageSubtitle.innerText = "Band 9 Sentence Architecture";

        let html = `<p style="margin-bottom: 20px; color: var(--text-secondary);">A paragraph is a chain of ideas where every sentence performs a specific job.</p>`;

        data.families.forEach(family => {
            html += `
            <div class="card">
                <h3>${family.name}</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Pattern</th>
                            <th>Purpose</th>
                            <th>Example</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${family.items.map(item => `
                            <tr>
                                <td><strong>${item.pattern}</strong><br/><small>${item.formula}</small></td>
                                <td>${item.purpose}</td>
                                <td>${item.example}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>`;
        });

        contentBody.innerHTML = html;
    }

    function renderLenses(lenses) {
        if(!lenses) return;
        pageTitle.innerText = "Idea Bank (Lenses)";
        pageSubtitle.innerText = "Master Idea Trees and Mechanism Chains by Topic";

        let html = `
        <div class="card" style="margin-bottom: 20px;">
            <p style="color: var(--text-secondary); margin: 0;">Select a lens below to explore its core concepts, logical chains, high-band collocations, and pre-written Band 9 paragraphs.</p>
        </div>
        <div class="grid-2">
        `;

        Object.keys(lenses).forEach(key => {
            const topic = lenses[key];
            html += `
            <div class="card interactive-card" style="cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onclick="window.loadIeltsContent('lens-${key}')">
                <h3 style="font-size: 1.25rem; margin-bottom: 8px; color: var(--accent-color); display: flex; align-items: center; gap: 10px;">
                    <i class="fa-solid fa-network-wired"></i> ${topic.name}
                </h3>
                <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
                    <strong>Concepts:</strong> ${topic.concepts.join(', ')}
                </p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span class="badge" style="background: rgba(52, 152, 219, 0.1); color: var(--accent-color); font-weight: 600;">
                        ${topic.chains.length} Chains
                    </span>
                    <span style="font-size: 0.8rem; color: var(--accent-color); font-weight: 500;">Explore <i class="fa-solid fa-arrow-right"></i></span>
                </div>
            </div>`;
        });

        html += `</div>`;
        contentBody.innerHTML = html;
    }

    function getCustomTopicSentence(title) {
        const map = {
            // Social
            "Community Service → Civic Responsibility": "Engaging in community service projects helps young citizens develop a strong sense of civic responsibility.",
            "Public Parks → Community Cohesion": "Constructing green public spaces is a highly effective way to foster local community cohesion.",
            "Youth Clubs → Decreased Delinquency": "Providing youth sports and social clubs plays a critical role in reducing juvenile delinquency.",
            "Inclusive Workplaces → Social Mobility": "Promoting inclusive hiring protocols empowers marginalized demographics and supports upward social mobility.",
            "Volunteering Programs → Social Integration": "Public volunteering programs connect diverse groups, helping to reduce social isolation.",
            "Universal Design → Accessibility": "Implementing universal design principles guarantees physical accessibility and equal opportunities for disabled citizens.",

            // Economic
            "Education Investment → Economic Growth": "Heavily subsidizing higher education plays a vital role in stimulating long-term national economic growth.",
            "Infrastructure Development → Job Creation": "Investing in public infrastructure projects generates immediate employment and boosts local economies.",
            "Small Business Subsidies → Entrepreneurial Innovation": "Subsidizing start-up companies reduces initial overhead costs and fosters entrepreneurial innovation.",
            "Trade Deregulation → Global Market Expansion": "Lowering trade barriers allows domestic businesses to expand their reach into global markets.",
            "Vocational Training Programs → Skilled Labor Supply": "Funding vocational apprenticeships is essential for maintaining a steady supply of skilled technicians.",
            "Green Technology Investment → Sustainable Industries": "Investing in clean technology serves as a key catalyst for the development of sustainable modern industries.",

            // Environmental
            "Renewable Energy → Sustainable Development": "Transitioning to renewable energy resources is a critical step toward achieving sustainable development.",
            "Recycling → Waste Reduction": "Household recycling initiatives are highly effective at minimizing landfill waste and resource depletion.",
            "Reforestation → Biodiversity Preservation": "Active reforestation efforts are vital for preserving native habitats and global biodiversity.",
            "Sustainable Agriculture → Soil Conservation": "Adopting sustainable farming methods protects soil quality and prevents groundwater pollution.",
            "Green Transportation → Clean Air": "Transitioning to electric vehicles is instrumental in reducing urban smog and improving air quality.",
            "Eco-Tourism → Habitat Protection": "Responsible eco-tourism generates critical funding to protect fragile ecosystems and wild habitats.",

            // Educational
            "Practical Learning → Employability": "Incorporating vocational training into academic curriculums significantly enhances graduate employability.",
            "Critical Thinking Skills → Independent Problem Solving": "Encouraging classroom debate cultivates critical thinking skills and fosters intellectual independence.",
            "Inclusion of Arts → Creative Innovation": "Integrating creative arts into education is highly beneficial for nurturing divergent thinking in students.",
            "Bilingual Education → Cognitive Flexibility": "Introducing foreign languages in early childhood stimulates cognitive flexibility and communication skills.",
            "Universal Primary Education → Illiteracy Eradication": "Subsidizing primary classrooms in impoverished areas is the most reliable way to eradicate illiteracy.",
            "Civic Education → Social Responsibility": "Teaching civic rights and duties helps students develop a strong sense of social responsibility.",

            // Technological
            "Automation → Workplace Efficiency": "Implementing automated systems streamlines corporate workflows and maximizes workplace efficiency.",
            "Digital Communication → Global Connectivity": "Digital communication tools dismantle geographical barriers, fostering instant global connectivity.",
            "Telemedicine → Healthcare Accessibility": "Virtual telemedicine consultations make health diagnostics accessible to remote populations.",
            "E-Learning Platforms → Democratic Education": "Online educational portals play a key role in democratizing academic access for disadvantaged students.",
            "Smart Cities → Energy Conservation": "Integrating smart sensors into urban grids helps optimize energy distribution and lower public costs.",
            "Data Analytics → Personalized Services": "Leveraging data analytics allows businesses to deliver personalized consumer experiences.",

            // Health
            "Preventive Care → Reduced Healthcare Costs": "Promoting preventative healthcare measures dramatically reduces national medical expenditures.",
            "Sugar Taxation → Reduced Obesity Rates": "Imposing taxes on sugary soft drinks is a proven policy for curbing childhood obesity rates.",
            "Physical Education → Cardio Fitness": "Mandating physical education in schools is highly effective at boosting cardiovascular fitness in youth.",
            "Mental Health Campaigns → Reduced Social Stigma": "Funding public awareness campaigns is essential for dismantling the social stigma surrounding mental health.",
            "Clean Water Initiatives → Disease Prevention": "Installing clean water filtration systems in rural communities directly prevents waterborne diseases.",
            "Sleep Hygiene Education → Sleep Quality": "Educating the public on proper sleep hygiene plays a vital role in improving sleep quality.",

            // Psychological
            "Financial Security → Peace of Mind": "Establishing a financial emergency fund alleviates stress and provides essential peace of mind.",
            "Achievement → Self-Confidence": "Acquiring new competencies enables personal growth and boosts individual self-confidence.",
            "Social Support → Emotional Stability": "Maintaining strong social connections provides emotional support and fosters mental resilience.",
            "Work-Life Balance → Reduced Burnout": "Prioritizing a healthy work-life balance is a critical measure to prevent professional burnout.",
            "Mindfulness Practice → Stress Reduction": "Engaging in mindfulness practices regulates emotional responses and reduces daily anxiety.",
            "Creative Outlets → Self-Expression": "Pursuing creative hobbies offers a valuable channel for emotional self-expression.",

            // Cultural
            "International Travel → Open-mindedness": "Immersing oneself in foreign cultures helps dismantle preconceived stereotypes and fosters open-mindedness.",
            "Heritage Preservation → Cultural Identity": "Restoring historical landmarks is vital for preserving a community's unique cultural identity.",
            "Cultural Festivals → Intercultural Harmony": "Sponsoring multicultural festivals celebrates diversity and fosters intercultural harmony.",
            "Language Revitalization → Indigenous Heritage": "Funding immersion programs to save endangered languages protects rich indigenous heritages.",
            "Museum Subsidies → Public Education": "Subsidizing museums increases cultural literacy and enhances public education outside the classroom.",
            "Global Exchange Programs → International Collaboration": "Sponsoring student exchange programs builds international friendships and joint academic research.",

            // Government
            "Taxation → Behavioral Change": "Implementing prohibitive taxes on harmful goods is highly effective at forcing behavioral changes.",
            "Fines → Environmental Laws Enforce": "Imposing severe financial fines on industrial polluters enforces compliance with environmental laws.",
            "Welfare Benefits → Reduced Poverty Rates": "Distributing welfare benefits to low-income households directly reduces poverty rates.",
            "Public Infrastructure Funding → Traffic Reduction": "Allocating state funds to expand mass transit infrastructure is key to reducing traffic congestion.",
            "Mandatory Labeling → Consumer Awareness": "Mandating nutrition labeling on food packages increases consumer awareness of healthy eating habits.",
            "Rent Controls → Housing Affordability": "Enforcing rent control laws protects tenants from eviction and stabilizes housing affordability.",

            // Infrastructure
            "Public Transport → Reduced Congestion": "Expanding public transit networks is the most sustainable approach to mitigating traffic congestion.",
            "Bicycle Lanes → Sustainable Commuting": "Constructing dedicated bicycle lanes guarantees cyclist safety and encourages sustainable commuting.",
            "Affordable Housing → Reduced Homelessness": "Building affordable public housing projects provides shelter and reduces street homelessness.",
            "Pedestrian Zones → Retail Growth": "Pedestrianizing downtown shopping streets increases foot traffic and boosts local retail growth.",
            "Renewable Grids → Energy Independence": "Integrating solar and wind power into national grids supports long-term energy independence.",
            "Waste Management Systems → Environmental Protection": "Upgrading municipal waste management facilities prevents soil contamination and protects the environment.",

            // Consumerism
            "Ethical Purchasing → Corporate Accountability": "Boycotting unethical products exerts financial pressure that forces corporate accountability.",
            "Mass Advertising → Emotional Unsatisfaction": "Constant exposure to luxury advertising drives impulsive spending and emotional dissatisfaction.",
            "Fast Fashion → Environmental Destruction": "The rapid production of cheap synthetic clothing increases landfill waste and drives environmental destruction.",
            "Buy Local Campaigns → Regional Prosperity": "Supporting local businesses keeps capital inside the community and drives regional prosperity.",
            "Minimalist Lifestyles → Financial Freedom": "Embracing a minimalist lifestyle curbs impulsive buying and fosters long-term financial freedom.",
            "Single-Use Bans → Plastic Waste Reduction": "Banning single-use plastics minimizes marine pollution and protects aquatic ecosystems.",

            // Individual
            "Career Autonomy → Job Satisfaction": "Allowing workers to choose their own career trajectories boosts motivation and job satisfaction.",
            "Personal Liberty → Creative Expression": "Protecting personal liberty encourages individuals to challenge orthodox views and drives creative expression.",
            "Individual Choice → Academic Motivation": "Offering elective choices in school curricula nurtures intrinsic motivation and academic engagement.",
            "Self-Determination → Financial Prudence": "Assuming personal accountability for one's choices promotes long-term financial prudence.",
            "Life Freedom → Emotional Well-being": "The freedom to make private lifestyle choices reduces cognitive dissonance and improves emotional well-being.",
            "Personal Responsibility → Character Resilience": "Bearing the consequences of one's decisions fosters self-discipline and builds character resilience.",

            // Media
            "Sensational Journalism → Public Anxiety": "Broadcasting sensationalist news stories distorts reality and heightens public anxiety.",
            "Algorithmic Filtering → Polarization": "Deploying algorithmic content filtering confines users to digital echo chambers and increases political polarization.",
            "Investigative Reporting → Political Accountability": "Conducting investigative journalism exposes corruption and enforces government accountability.",
            "Targeted Advertising → Impulsive Consumerism": "Leveraging user data for targeted advertising triggers impulsive buying and consumerism.",
            "Press Censorship → Authoritarian Control": "Imposing strict press censorship restricts public knowledge and consolidates authoritarian control.",
            "Information Overload → Decision Paralysis": "Encountering endless flows of online news causes information overload and decision paralysis.",

            // Global
            "Corporate Expansion → Local Business Loss": "The rapid expansion of global retail chains undercuts local prices and erodes small businesses.",
            "Globalized Brands → Cultural Homogenization": "Exporting globalized brands standardizes consumer tastes and causes cultural homogenization.",
            "Global Trade → Economic Interdependence": "Lowering trade tariffs facilitates international commerce and increases economic interdependence.",
            "International Tourism → Indigenous Heritage Income": "Attracting international tourism provides communities with revenues that support indigenous heritage preservation.",
            "Global Labor Arbitrage → Brain Drain": "Offering high overseas salaries lures educated graduates away, triggering a systemic brain drain.",
            "Global Standards → Standardized Education": "Adopting global educational standards dilutes local historical focus and standardizes classroom values.",

            // Science
            "Genetic Editing → Eradication of Diseases": "Harnessing gene-editing technologies like CRISPR makes it possible to eradicate hereditary diseases.",
            "Commercial Scientific Focus → Ethical Violations": "Chasing corporate profits in commercial laboratories can compromise patient safety and lead to ethical violations.",
            "Space Exploration → Resource Innovation": "Funding space exploration programs drives research that develops critical spin-off technologies for daily life.",
            "Artificial Cloning → Loss of Biodiversity": "Cloning elite agricultural livestock homogenizes animal genomes and risks a loss of biodiversity.",
            "Clinical Trial Regulations → Patient Safety": "Enforcing strict clinical trial regulations protects patients from toxic side effects of experimental drugs.",
            "Cognitive AI Research → Workplace Disruption": "Advancing cognitive artificial intelligence displaces white-collar workers and causes workplace disruption."
        };
        
        if (map[title]) {
            return map[title];
        }
        const parts = title.split('→');
        const action = parts[0] ? parts[0].trim() : '';
        const outcome = parts[1] ? parts[1].trim() : '';
        return `Prioritizing ${action.toLowerCase()} plays a vital role in driving ${outcome.toLowerCase()}.`;
    }

    function renderSingleLens(topic, id) {
        if(!topic) {
            contentBody.innerHTML = '<p>Lens data being compiled...</p>';
            return;
        }
        pageTitle.innerText = topic.name + " LENS";
        pageSubtitle.innerText = "Master Idea Trees and Mechanism Chains";

        let html = `
        <div style="margin-bottom: 20px;">
            <button class="btn" style="background: var(--card-bg); border: 1px solid var(--border-color); padding: 8px 16px; border-radius: 6px; cursor: pointer; color: var(--text-primary); font-weight: 600; display: inline-flex; align-items: center; gap: 8px;" onclick="window.loadIeltsContent('task2-lenses')">
                <i class="fa-solid fa-arrow-left"></i> Back to Lenses
            </button>
        </div>
        <div class="card">
            <h3 style="font-size: 1.5rem;"><i class="fa-solid fa-network-wired"></i> Core Concepts</h3>
            <p>${topic.concepts.map(c => `<span class="badge">${c}</span>`).join('')}</p>
        </div>`;
            
        topic.chains.forEach((chain, index) => {
            const topicSentence = getCustomTopicSentence(chain.title);

            html += `
            <div class="card">
                <h4 style="color: var(--text-primary); margin-bottom: 5px; font-size: 1.3rem;">Chain ${index + 1}: ${chain.title}</h4>
                <div style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 20px; font-style: italic;">
                    <i class="fa-solid fa-bullseye" style="color: var(--accent-color); margin-right: 6px;"></i> ${topicSentence}
                </div>
                <div class="grid-2">
                    <!-- Left Column -->
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div class="blueprint-box" style="margin:0; flex: 1;">
                            <strong>Mechanism Learning:</strong><br/>
                            ${chain.steps.map((step, i) => `
                                <div style="margin-left: ${i*10}px; margin-bottom: 4px;">${i===0 ? '' : '↳ '} ${step}</div>
                            `).join('')}
                        </div>
                        <div style="background: rgba(255,255,255,0.03); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);">
                            <strong style="display:block; margin-bottom:10px;"><i class="fa-solid fa-feather"></i> High-Band Collocations:</strong>
                            ${chain.collocations.map(c => `<span style="display:inline-block; margin-right:15px; margin-bottom:5px; color: var(--accent-color); font-size: 0.9rem;">✓ ${c}</span>`).join('')}
                        </div>
                    </div>
                    <!-- Right Column -->
                    <div style="display: flex; flex-direction: column; gap: 15px;">
                        <div class="essay-text" style="margin:0; font-size: 0.95rem; flex: 1; line-height: 1.6;">
                            <strong style="display:block; margin-bottom: 10px;">Band 9 Paragraph:</strong>
                            ${chain.paragraph}
                        </div>
                        <div style="background: rgba(255, 255, 255, 0.03); padding: 15px; border-radius: 8px; border: 1px solid var(--border-color);">
                            <strong style="display:block; margin-bottom:10px;"><i class="fa-solid fa-code-branch"></i> Connecting Sentence Architecture:</strong>
                            ${chain.architecture && chain.architecture.length ? chain.architecture.map(a => `<span class="badge">${a}</span>`).join('') : `<span style="color: var(--text-secondary);">Standard linking structure</span>`}
                        </div>
                    </div>
                </div>
            </div>`;
        });

        // Append Vocabulary & Mechanism Map Summary
        html += `
        <div class="card" style="margin-top: 40px;">
            <h3 style="font-size: 1.4rem; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px; display: flex; align-items: center; gap: 10px;">
                <i class="fa-solid fa-layer-group"></i> Vocabulary & Mechanism Map
            </h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; width: 100%;">
                ${topic.chains.map((chain, index) => `
                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); padding: 15px; border-radius: 8px; display: flex; flex-direction: column;">
                        <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 8px; color: var(--accent-color); border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">
                            Chain ${index + 1}
                        </div>
                        <div style="font-size: 0.8rem; font-weight: 600; margin-bottom: 12px; min-height: 38px; line-height: 1.3; color: var(--text-primary);">
                            ${chain.title}
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px; flex: 1;">
                            ${chain.collocations.map((c, i) => `
                                <div style="border-left: 2px solid var(--accent-color); padding-left: 8px; line-height: 1.4; color: #ffffff; font-size: 0.8rem;">
                                    ${c}
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`;

        contentBody.innerHTML = html;
    }

    // Expose loadContent globally so dashboard onclick can trigger it
    window.loadIeltsContent = loadContent;

    function getMatchedLenses(lensStr) {
        if (!lensStr) return [];
        const normalized = lensStr.toLowerCase();
        const possibleKeys = [
            "social", "economic", "environmental", "educational", "technological", 
            "health", "psychological", "cultural", "government", "infrastructure", 
            "consumerism", "individual", "media", "global", "science"
        ];
        
        return possibleKeys.filter(key => {
            if (key === "educational" && (normalized.includes("education") || normalized.includes("educational"))) return true;
            if (key === "technological" && (normalized.includes("techno") || normalized.includes("technology"))) return true;
            if (key === "government" && (normalized.includes("govern") || normalized.includes("policy"))) return true;
            if (key === "science" && (normalized.includes("science") || normalized.includes("ethical") || normalized.includes("ethics"))) return true;
            return normalized.includes(key);
        });
    }

    function isChainRelated(chain, essay) {
        const normalizedEssay = essay.toLowerCase();
        
        // Check if exact title parts appear contiguously in the essay
        const titleParts = chain.title.toLowerCase().split('→').map(p => p.trim());
        for (const part of titleParts) {
            if (normalizedEssay.includes(part)) return true;
        }

        // Check if any collocation keywords match the essay
        const verbsToStrip = ["foster", "bridge", "mitigate", "promote", "alleviate", "exacerbate", "stimulate", "boost", "drive", "combat", "reduce", "increase", "improve", "develop", "nurture", "cultivate", "acquire", "attain", "achieve", "implement"];
        for (const collocation of chain.collocations) {
            const normCol = collocation.toLowerCase().trim();
            if (normalizedEssay.includes(normCol)) return true;
            
            let stripped = normCol;
            for (const verb of verbsToStrip) {
                if (normCol.startsWith(verb + ' ')) {
                    stripped = normCol.substring(verb.length + 1).trim();
                    break;
                }
            }
            if (stripped.length > 4 && normalizedEssay.includes(stripped)) return true;
        }
        
        return false;
    }

    function renderTask2Essays(data) {
        if(!data) return;
        pageTitle.innerText = data.title;
        pageSubtitle.innerText = data.subtitle;

        let html = `<div class="card">
            <h3>The Science</h3>
            <ul>${data.science.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>`;

        data.examples.forEach((ex, index) => {
            const matchedKeys = getMatchedLenses(ex.lens);
            let lensesHtml = '';
            
            if (window.ieltsData && window.ieltsData.task2.lenses) {
                const lenses = window.ieltsData.task2.lenses;
                matchedKeys.forEach(key => {
                    const lens = lenses[key];
                    if (lens) {
                        const relatedChains = lens.chains.filter(chain => isChainRelated(chain, ex.essay));
                        const chainsToShow = relatedChains.length > 0 ? relatedChains : lens.chains;

                        lensesHtml += `
                        <details style="background: rgba(56, 189, 248, 0.03); border: 1px solid var(--border-color); border-radius: 8px; padding: 12px; margin-bottom: 15px;">
                            <summary style="font-weight: 600; cursor: pointer; color: var(--accent-color); font-size: 0.9rem;">
                                <i class="fa-solid fa-lightbulb"></i> How to Use <strong>${lens.name}</strong> Lens Mechanisms
                            </summary>
                            <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 10px;">
                                ${chainsToShow.map(chain => {
                                    const topicSentence = getCustomTopicSentence(chain.title);
                                    return `
                                    <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); padding: 10px; border-radius: 6px; font-size: 0.85rem;">
                                        <div style="font-weight: 700; color: var(--text-primary); margin-bottom: 4px;">${chain.title}</div>
                                        <div style="color: #ffffff; margin-bottom: 6px; font-size: 0.8rem; font-style: italic;">
                                            "${topicSentence}"
                                        </div>
                                        <div style="color: var(--text-secondary); font-size: 0.78rem; line-height: 1.4;">
                                            <strong style="color: var(--accent-color);">Flow:</strong> ${chain.steps.join(' &rarr; ')}
                                        </div>
                                    </div>
                                    `;
                                }).join('')}
                            </div>
                        </details>
                        `;
                    }
                });
            }

            html += `
            <div class="card">
                <h3>Example ${index + 1}: ${ex.title}</h3>
                <div class="prompt"><strong>PROMPT:</strong> ${ex.prompt}</div>
                <div style="margin-bottom: 15px;">
                    <span class="badge"><i class="fa-solid fa-glasses"></i> Lens: ${ex.lens}</span>
                </div>
                ${lensesHtml}
                <div class="blueprint-box" style="margin-bottom: 20px;">
                    <strong>THE CONVERSATION:</strong><br/>
                    ${ex.conversation.map(c => {
                        if (c.isHeading) {
                            return `<div class="blueprint-section-title" style="font-weight: 700; margin-top: 15px; margin-bottom: 8px; color: var(--accent-color); border-bottom: 1px dashed var(--border-color); padding-bottom: 4px; font-size: 0.95rem;">${c.text}</div>`;
                        }
                        return `<div class="blueprint-step" style="margin-left: 10px; margin-bottom: 4px;"><span class="blueprint-label" style="font-weight: 600;">${c.label}:</span> ${c.text}</div>`;
                    }).join('')}
                </div>
                <div class="essay-text">
                    <strong style="display:block; margin-bottom: 8px;">BAND 9 ESSAY:</strong>
                    ${formatEssay(ex.essay)}
                </div>
            </div>`;
        });

        contentBody.innerHTML = html;
    }

    function renderSpeaking() {
        pageTitle.innerText = "Speaking Hub";
        pageSubtitle.innerText = "Coming Soon";
        contentBody.innerHTML = `<div class="card"><p>Speaking strategies and mock tests will be populated here in the future.</p></div>`;
    }

});
