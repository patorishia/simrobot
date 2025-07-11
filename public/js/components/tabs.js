///public/js/components/tabs.js
function toggleTabs(groupSelector, selectedId, activeClasses, inactiveClasses) {
    document.querySelectorAll(groupSelector).forEach(btn => {
        if (btn.id === selectedId) {
            btn.classList.add(...activeClasses);
            btn.classList.remove(...inactiveClasses);
            btn.setAttribute('aria-selected', 'true');
        } else {
            btn.classList.remove(...activeClasses);
            btn.classList.add(...inactiveClasses);
            btn.setAttribute('aria-selected', 'false');
        }
    });
}

function setupTabs() {
    // Tabs dos simuladores
    const tab1 = document.getElementById('tab1');
    const tab2 = document.getElementById('tab2');
    const sim1 = document.getElementById('simulador1');
    const sim2 = document.getElementById('simulador2');

    if (tab1 && tab2 && sim1 && sim2) {
        tab1.addEventListener('click', () => {
            sim1.classList.remove('hidden');
            sim2.classList.add('hidden');
            toggleTabs('.tab-sim', 'tab1',
                ['text-blue-700', 'dark:text-blue-400', 'border-blue-600', 'bg-blue-50', 'dark:bg-gray-700'],
                ['text-gray-600', 'dark:text-gray-400', 'border-transparent', 'bg-white', 'dark:bg-gray-800']
            );
        });

        tab2.addEventListener('click', () => {
            sim1.classList.add('hidden');
            sim2.classList.remove('hidden');
            if (!workspace) {
                setTimeout(() => {
                    workspace = Blockly.inject('blocklyDiv', {
                        toolbox: document.getElementById('toolbox')
                    });
                }, 0);
            } else {
                setTimeout(() => {
                    Blockly.svgResize(workspace);
                }, 0);
            }

            if (!sim2.dataset.loaded) {
                window.initSimulador2().then(() => {
                    sim2.dataset.loaded = "true";
                });
            } else {
                Blockly.svgResize(workspace);
            }

            toggleTabs('.tab-sim', 'tab2',
                ['text-blue-700', 'dark:text-blue-400', 'border-blue-600', 'bg-blue-50', 'dark:bg-gray-700'],
                ['text-gray-600', 'dark:text-gray-400', 'border-transparent', 'bg-white', 'dark:bg-gray-800']
            );
        });
    }

    // Tabs internas do simulador (Configurações e Logs)
    const tabControles = document.getElementById('tabControles');
    const tabLogs = document.getElementById('tabLogs');
    const panelControles = document.getElementById('panelControles');
    const panelLogs = document.getElementById('panelLogs');

    if (tabControles && tabLogs && panelControles && panelLogs) {
        tabControles.addEventListener('click', () => {
            console.log('Clique em Controles!');
            panelControles.classList.remove('hidden');
            panelLogs.classList.add('hidden');
            toggleTabs('.tab-inner', 'tabControles',
                ['text-blue-700', 'dark:text-blue-400', 'border-blue-600'],
                ['text-gray-600', 'dark:text-gray-400', 'border-transparent']
            );
        });

        tabLogs.addEventListener('click', () => {
            console.log('Clique em Logs!');
            panelLogs.classList.remove('hidden');
            panelControles.classList.add('hidden');
            toggleTabs('.tab-inner', 'tabLogs',
                ['text-blue-700', 'dark:text-blue-400', 'border-blue-600'],
                ['text-gray-600', 'dark:text-gray-400', 'border-transparent']
            );
        });
    }
}

