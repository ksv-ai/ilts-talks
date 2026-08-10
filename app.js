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
            html += `
            <div class="card">
                <h4 style="color: var(--text-primary); margin-bottom: 20px; font-size: 1.3rem;">Chain ${index + 1}: ${chain.title}</h4>
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
            <div style="overflow-x: auto; padding-bottom: 10px; margin: 0 -10px;">
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 15px; min-width: 1000px; padding: 0 10px;">
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
                                    <div style="border-left: 2px solid var(--accent-color); padding-left: 8px; line-height: 1.4; color: var(--text-secondary); font-size: 0.8rem;">
                                        ${c}
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>`;

        contentBody.innerHTML = html;
    }

    // Expose loadContent globally so dashboard onclick can trigger it
    window.loadIeltsContent = loadContent;

    function renderTask2Essays(data) {
        if(!data) return;
        pageTitle.innerText = data.title;
        pageSubtitle.innerText = data.subtitle;

        let html = `<div class="card">
            <h3>The Science</h3>
            <ul>${data.science.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>`;

        data.examples.forEach((ex, index) => {
            html += `
            <div class="card">
                <h3>Example ${index + 1}: ${ex.title}</h3>
                <div class="prompt"><strong>PROMPT:</strong> ${ex.prompt}</div>
                <div style="margin-bottom: 15px;">
                    <span class="badge"><i class="fa-solid fa-glasses"></i> Lens: ${ex.lens}</span>
                </div>
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
