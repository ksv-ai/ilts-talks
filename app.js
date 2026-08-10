document.addEventListener('DOMContentLoaded', () => {
    const navItems = document.querySelectorAll('.nav-item');
    const contentBody = document.getElementById('content-body');
    const pageTitle = document.getElementById('page-title');
    const pageSubtitle = document.getElementById('page-subtitle');
    const themeToggle = document.getElementById('theme-toggle');

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
            renderTask1(data.task1[chartType], chartType);
        } else if (target === 'task2-playbook') {
            renderPlaybook(data.task2.playbook);
        } else if (target === 'task2-lenses') {
            renderLenses(data.task2.lenses);
        } else if (target.startsWith('task2-')) {
            const essayType = target.split('-')[1];
            renderTask2Essays(data.task2.essays[essayType]);
        } else if (target === 'speaking-hub') {
            renderSpeaking();
        }
    }

    function renderTask1(data, chartType) {
        if(!data) return;
        pageTitle.innerText = data.title;
        pageSubtitle.innerText = data.subtitle;

        const figureMap = {
            'line': '1_Line_Graphs.html',
            'bar': '2_Bar_Charts.html',
            'pie': '3_Pie_Charts.html',
            'table': '4_Tables.html',
            'multi': '5_Multiple_Charts.html',
            'map': '6_Maps.html',
            'process': '7_Processes.html'
        };

        let html = '';

        if (figureMap[chartType]) {
            html += `
            <div class="card" style="padding: 0; overflow: hidden; height: 750px;">
                <iframe src="IELTS_Prep/Figures/${figureMap[chartType]}" style="width: 100%; height: 100%; border: none;"></iframe>
            </div>`;
        }

        html += `<div class="card">
            <h3>Core Strategy</h3>
            <ul>${data.strategy.map(s => `<li>${s}</li>`).join('')}</ul>
        </div>`;

        data.examples.forEach((ex, index) => {
            html += `
            <div class="card">
                <h3>Example ${index + 1}: ${ex.title}</h3>
                <div class="prompt"><strong>PROMPT:</strong> ${ex.prompt}</div>
                <div class="blueprint-box">
                    <strong>PLANNING NOTE:</strong><br/>
                    ${ex.planning.map(p => `<div>${p}</div>`).join('')}
                </div>
                <div class="essay-text">
                    <strong>BAND 9 ESSAY:</strong><br/>
                    ${ex.essay.replace(/\n/g, '<br/>')}
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

    function renderLenses(data) {
        if(!data) return;
        pageTitle.innerText = "Knowledge Network";
        pageSubtitle.innerText = "Master Idea Trees and Mechanism Chains";

        let html = '';
        data.topics.forEach(topic => {
            html += `
            <div class="card">
                <h3 style="font-size: 1.5rem;"><i class="fa-solid fa-network-wired"></i> LENS: ${topic.name}</h3>
                <p><strong>Core Concepts:</strong> ${topic.concepts.map(c => `<span class="badge">${c}</span>`).join('')}</p>
                <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 20px 0;">
                
                ${topic.chains.map((chain, index) => `
                    <div style="margin-bottom: 30px;">
                        <h4 style="color: var(--text-primary); margin-bottom: 10px;">Chain ${index + 1}: ${chain.title}</h4>
                        <div class="grid-2">
                            <div class="blueprint-box" style="margin:0;">
                                <strong>Mechanism Learning:</strong><br/>
                                ${chain.steps.map((step, i) => `
                                    <div style="margin-left: ${i*10}px;">${i===0 ? '' : '↳ '} ${step}</div>
                                `).join('')}
                            </div>
                            <div>
                                <div class="essay-text" style="margin-bottom: 10px; font-size: 0.95rem;">
                                    <strong>Band 9 Paragraph:</strong><br/>
                                    ${chain.paragraph}
                                </div>
                                <div style="background: rgba(255,255,255,0.05); padding: 10px; border-radius: 5px;">
                                    <strong>Collocations:</strong><br/>
                                    ${chain.collocations.map(c => `<span style="display:inline-block; margin-right:10px; color: var(--accent-color);">✓ ${c}</span>`).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>`;
        });

        contentBody.innerHTML = html;
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
            html += `
            <div class="card">
                <h3>Example ${index + 1}: ${ex.title}</h3>
                <div class="prompt"><strong>PROMPT:</strong> ${ex.prompt}</div>
                <div style="margin-bottom: 15px;">
                    <span class="badge"><i class="fa-solid fa-glasses"></i> Lens: ${ex.lens}</span>
                </div>
                <div class="grid-2">
                    <div class="blueprint-box" style="margin: 0;">
                        <strong>THE CONVERSATION:</strong><br/>
                        ${ex.conversation.map(c => `<div class="blueprint-step"><span class="blueprint-label">${c.label}:</span> ${c.text}</div>`).join('')}
                    </div>
                    <div class="essay-text" style="margin: 0;">
                        <strong>BAND 9 ESSAY:</strong><br/>
                        ${ex.essay.replace(/\n/g, '<br/><br/>')}
                    </div>
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
