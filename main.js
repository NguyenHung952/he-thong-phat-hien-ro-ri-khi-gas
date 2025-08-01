document.addEventListener('DOMContentLoaded', function () {
    const componentNodes = document.querySelectorAll('.component-node');
    const infoContents = document.querySelectorAll('.info-content');
    const infoPanel = document.getElementById('info-panel');
    const defaultInfo = document.getElementById('info-default');
    let activeNode = null;

    componentNodes.forEach(node => {
        node.addEventListener('click', () => {
            const targetId = node.dataset.target;
            const targetContent = document.getElementById(targetId);

            if (activeNode) {
                activeNode.classList.remove('bg-teal-100', 'ring-2', 'ring-teal-400');
            }

            if (activeNode === node) {
                activeNode = null;
                infoContents.forEach(content => content.classList.add('hidden'));
                defaultInfo.classList.remove('hidden');
            } else {
                activeNode = node;
                node.classList.add('bg-teal-100', 'ring-2', 'ring-teal-400');
                infoContents.forEach(content => content.classList.add('hidden'));
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                }
            }
        });
    });

    const mobileNav = document.getElementById('mobile-nav');
    mobileNav.addEventListener('change', (e) => {
        window.location.href = e.target.value;
    });

    const SAFETY_THRESHOLD = 200;
    let chartInstance;
    let simulationInterval;
    let chartData = {
        labels: Array.from({ length: 20 }, (_, i) => `-${20 - i}s`),
        datasets: [{
            label: 'Nồng độ Gas (ppm)',
            data: Array(20).fill(55),
            borderColor: 'rgb(56, 189, 248)',
            backgroundColor: 'rgba(56, 189, 248, 0.1)',
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
            fill: true,
        }]
    };

    const ctx = document.getElementById('gasChart').getContext('2d');

    function createChart() {
        if (chartInstance) {
            chartInstance.destroy();
        }
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 500,
                        title: {
                            display: true,
                            text: 'Nồng độ (ppm)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Thời gian'
                        }
                    }
                },
                plugins: {
                    legend: { display: false },
                    tooltip: { mode: 'index', intersect: false }
                },
                animation: { duration: 200 }
            }
        });
    }

    const statusPanel = document.getElementById('status-panel');
    const statusText = document.getElementById('status-text');
    const ppmValue = document.getElementById('ppm-value');
    const localAlertIcon = document.getElementById('local-alert-icon');
    const remoteAlertIcon = document.getElementById('remote-alert-icon');

    function updateStatus(ppm) {
        ppmValue.textContent = Math.round(ppm);
        if (ppm >= SAFETY_THRESHOLD) {
            statusPanel.className = 'p-4 rounded-lg text-center transition-all duration-300 bg-red-100 border border-red-300';
            statusText.className = 'font-bold text-xl text-red-800';
            statusText.textContent = 'CẢNH BÁO';
            ppmValue.className = 'text-3xl font-bold text-red-700 mt-1';
            localAlertIcon.className = 'w-4 h-4 rounded-full bg-red-500 mr-2 animate-pulse';
            remoteAlertIcon.className = 'w-4 h-4 rounded-full bg-red-500 mr-2 animate-pulse';
        } else {
            statusPanel.className = 'p-4 rounded-lg text-center transition-all duration-300 bg-green-100 border border-green-300';
            statusText.className = 'font-bold text-xl text-green-800';
            statusText.textContent = 'AN TOÀN';
            ppmValue.className = 'text-3xl font-bold text-green-700 mt-1';
            localAlertIcon.className = 'w-4 h-4 rounded-full bg-gray-300 mr-2';
            remoteAlertIcon.className = 'w-4 h-4 rounded-full bg-gray-300 mr-2';
        }
    }

    function updateChart(newValue) {
        chartData.datasets[0].data.shift();
        chartData.datasets[0].data.push(newValue);
        chartData.labels.shift();
        chartData.labels.push(new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        chartInstance.update();
        updateStatus(newValue);
    }

    function startNormalSimulation() {
        clearInterval(simulationInterval);
        simulationInterval = setInterval(() => {
            const lastValue = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
            let newValue = lastValue + (Math.random() - 0.5) * 5;
            newValue = Math.max(50, Math.min(60, newValue));
            updateChart(newValue);
        }, 1000);
    }

    document.getElementById('simulate-leak-btn').addEventListener('click', () => {
        clearInterval(simulationInterval);
        let currentPPM = chartData.datasets[0].data[chartData.datasets[0].data.length - 1];
        const leakDuration = 10;
        let step = 0;
        simulationInterval = setInterval(() => {
            if (step < leakDuration) {
                currentPPM += Math.random() * 40 + 20;
                currentPPM = Math.min(450, currentPPM);
                updateChart(currentPPM);
                step++;
            } else {
                clearInterval(simulationInterval);
            }
        }, 500);
    });

    document.getElementById('reset-sim-btn').addEventListener('click', () => {
        clearInterval(simulationInterval);
        chartData.labels = Array.from({ length: 20 }, (_, i) => `-${20 - i}s`);
        chartData.datasets[0].data = Array(20).fill(55);
        createChart();
        updateStatus(55);
        startNormalSimulation();
    });

    createChart();
    startNormalSimulation();
});
