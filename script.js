document.addEventListener("DOMContentLoaded", function () {
    // Connect tracking interface to inputs
    document.getElementById("searchInput").addEventListener("input", renderAnalyticsDashboard);
    document.getElementById("branchFilter").addEventListener("change", renderAnalyticsDashboard);
    
    initThemeToggle();
    
    // Initial fetch from Node backend, then poll every 3 seconds
    fetchLiveTelemetry();
    setInterval(fetchLiveTelemetry, 3000);
});

function initThemeToggle() {
    const toggle = document.getElementById("theme-toggle");
    if (!toggle) return;
    toggle.addEventListener("click", function (e) {
        const option = e.target.closest(".theme-option");
        if (!option) return;
        document.querySelectorAll(".theme-option").forEach(opt => opt.classList.remove("active"));
        option.classList.add("active");
        document.documentElement.setAttribute("data-theme", option.getAttribute("data-theme"));
    });
}

function toggleBranchAccordion(button) {
    const card = button.closest(".branch-analytics-card");
    if (card) card.classList.toggle("is-expanded");
}

async function fetchLiveTelemetry() {
    try {
        // Poll your local backend API
        const response = await fetch('http://localhost:5000/api/metrics');
        const liveNodeData = await response.json();
        
        // Pass live server details along to handle rendering
        renderAnalyticsDashboard(liveNodeData);
    } catch (error) {
        console.warn("Live telemetry node backend offline. Rendering static mock assets instead.");
        // If your node backend is turned off, fallback safely to static table elements
        renderAnalyticsDashboard(null);
    }
}

function renderAnalyticsDashboard(liveNodeData = null) {
    const tableRows = document.querySelectorAll("#monitorTable tbody tr");
    const container = document.getElementById("analyticsGraphsContainer");
    const incidentWidget = document.getElementById("incidentLogWidget");
    const incidentList = document.getElementById("incidentList");

    const searchFilter = document.getElementById("searchInput").value.toLowerCase().trim();
    const branchFilter = document.getElementById("branchFilter").value.trim();

    if (!container) return;

    // Track which accordion elements are currently open so re-renders don't close them snap-shut
    const expandedBranches = Array.from(document.querySelectorAll('.branch-analytics-card.is-expanded'))
        .map(el => el.getAttribute('data-branch-name'));

    container.innerHTML = "";
    if (incidentList) incidentList.innerHTML = "";

    let branchDataMap = {};
    let globalTotal = 0, globalHealthy = 0, globalWarning = 0, globalCritical = 0;
    let crossIncidentsArray = [];

    // Process our dataset matrix
    tableRows.forEach(row => {
        const cells = row.cells;
        if (cells.length < 12) return;

        const branch = cells[0].innerText.trim();
        const pcId = cells[1].innerText.trim();
        const user = cells[2].innerText.trim();
        const storageHealth = cells[3].innerText.trim();
        const capacity = cells[4].innerText.trim();
        const used = cells[5].innerText.trim();
        const free = cells[6].innerText.trim();
        const sectorStatus = cells[7].innerText.trim();
        let cpuTemp = cells[8].innerText.trim();
        const boardTemp = cells[9].innerText.trim();
        const keyboard = cells[10].innerText.trim();
        let status = cells[11].innerText.trim().toLowerCase();

        // Inject live node analytics if server metrics loop returns a local connection
        if (liveNodeData && pcId === "RES-PC-01") {
            cpuTemp = `${liveNodeData.cpu_temp}°C`;
            if (liveNodeData.cpu_usage_pct > 85 || liveNodeData.memory_used_pct > 90) {
                status = "critical";
            } else if (liveNodeData.cpu_usage_pct > 70) {
                status = "warning";
            } else {
                status = "healthy";
            }
        }

        if (!(pcId.toLowerCase().includes(searchFilter) || user.toLowerCase().includes(searchFilter))) return;
        if (branchFilter !== "" && branch !== branchFilter) return;

        const numUsed = parseFloat(used) || 0;
        const numCap = parseFloat(capacity) || 1;
        const storagePercent = Math.round((numUsed / numCap) * 100) || 0;
        const numCpu = parseFloat(cpuTemp) || 0;

        globalTotal++;
        if (status === "healthy") globalHealthy++;
        else if (status === "warning") globalWarning++;
        else if (status === "critical") globalCritical++;

        if (!branchDataMap[branch]) branchDataMap[branch] = [];
        branchDataMap[branch].push({
            pcId, user, storageHealth, capacity, used, free, storagePercent,
            sectorStatus, cpuTemp, numCpu, boardTemp, keyboard, status
        });
    });

    // Write counts out to top dashboard statistics summary blocks
    if (document.getElementById("totalPCs")) document.getElementById("totalPCs").innerText = globalTotal;
    if (document.getElementById("healthyCount")) document.getElementById("healthyCount").innerText = globalHealthy;
    if (document.getElementById("warningCount")) document.getElementById("warningCount").innerText = globalWarning;
    if (document.getElementById("criticalCount")) document.getElementById("criticalCount").innerText = globalCritical;

    // Generate Accordion layout views
    for (const [branchName, pcs] of Object.entries(branchDataMap)) {
        let branchColor = "var(--color-primary)";
        let branchStateLabel = "Optimal Performance";
        let totalUsedSpace = 0, totalCapSpace = 0, unstableNodesCount = 0;

        pcs.forEach(p => {
            totalUsedSpace += parseFloat(p.used) || 0;
            totalCapSpace += parseFloat(p.capacity) || 0;
            if (p.status !== "healthy") unstableNodesCount++;
        });

        const aggregateBranchStoragePercent = Math.round((totalUsedSpace / totalCapSpace) * 100) || 0;

        if (pcs.some(p => p.status === 'critical')) {
            branchColor = "var(--color-error)";
            branchStateLabel = "Requires Action";
        } else if (pcs.some(p => p.status === 'warning')) {
            branchColor = "var(--color-warning)";
            branchStateLabel = "Throttled System Warning";
        }

        const isCurrentlyExpanded = expandedBranches.includes(branchName) || searchFilter !== "" || branchFilter !== "";
        const expansionClass = isCurrentlyExpanded ? "is-expanded" : "";

        let branchHtml = `
        <div class="branch-analytics-card ${expansionClass}" data-branch-name="${branchName}">
            <button class="branch-header-trigger" onclick="toggleBranchAccordion(this)">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                    <h2 style="font-size: var(--text-md); margin:0; display:flex; align-items:center; gap:8px; font-weight:var(--weight-semibold);">
                        ${branchName}
                        <span style="font-size: var(--text-xs); background: ${branchColor}15; color: ${branchColor}; padding: 2px 8px; border-radius: var(--radius-full); font-weight:var(--weight-bold); text-transform:uppercase;">${branchStateLabel}</span>
                    </h2>
                    <p style="font-size: var(--text-xs); color: var(--color-text-secondary); margin: 0;">Total Allocations: <b>${pcs.length} PCs Online</b> | Click to view diagnostic logs</p>
                </div>
                <span class="material-symbols-rounded chevron-icon" style="font-size: var(--text-xl);">expand_more</span>
            </button>

            <div class="branch-expand-content">
                <div style="padding: var(--space-lg); background: var(--color-background); display: flex; flex-direction: column; gap: var(--space-lg);">
                    <div style="background: var(--color-surface); border: 1px solid var(--color-border); padding: var(--space-md); border-radius: var(--radius-md); display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-lg); align-items: center;">
                        <div>
                            <h3 style="font-size: var(--text-xs); color: var(--color-text-secondary); margin-bottom: var(--space-xs); font-weight:var(--weight-semibold);">BRANCH STORAGE FOOTPRINT</h3>
                            <div style="font-size: var(--text-xl); margin-bottom: 6px; font-weight:var(--weight-bold);">${aggregateBranchStoragePercent}% Space Occupied</div>
                            <div class="gauge-track">
                                <div class="gauge-fill" style="width: ${aggregateBranchStoragePercent}%; background: ${aggregateBranchStoragePercent > 85 ? 'var(--color-error)' : 'var(--color-primary)'};"></div>
                            </div>
                        </div>
                        <div style="border-left: 1px dashed var(--color-border); padding-left: var(--space-lg);">
                            <h3 style="font-size: var(--text-xs); color: var(--color-text-secondary); margin-bottom: var(--space-xs); font-weight:var(--weight-semibold);">RISK VECTOR INDEX</h3>
                            <div style="font-size: var(--text-xl); font-weight:var(--weight-bold); color: ${unstableNodesCount > 0 ? 'var(--color-warning)' : 'var(--color-success)'}">
                                ${unstableNodesCount} Action Flags Raised
                            </div>
                            <p style="font-size: var(--text-xs); color: var(--color-text-muted); margin: 4px 0 0 0;">Out of ${pcs.length} active environment nodes.</p>
                        </div>
                    </div>
                    <div style="display: flex; flex-direction: column; gap: var(--space-md);">`;

        pcs.forEach(pc => {
            let alerts = [];
            if (pc.storagePercent >= 90) {
                crossIncidentsArray.push(`Device ${pc.pcId} (${branchName}) space allocation critical at ${pc.storagePercent}%. Backup data immediately.`);
                alerts.push(`<span style="background: var(--color-error)15; color: var(--color-error); padding: 4px var(--space-sm); border-radius: var(--radius-sm); display: inline-flex; align-items: center; gap: 4px; font-weight:var(--weight-semibold);"><span class="material-symbols-rounded" style="font-size:14px;">backup</span> STORAGE CRITICAL (${pc.storagePercent}%)</span>`);
            } else if (pc.storagePercent >= 75) {
                alerts.push(`<span style="background: var(--color-warning)15; color: var(--color-warning); padding: 4px var(--space-sm); border-radius: var(--radius-sm); display: inline-flex; align-items: center; gap: 4px; font-weight:var(--weight-semibold);"><span class="material-symbols-rounded" style="font-size:14px;">cloud_upload</span> Space Constraints</span>`);
            }

            if (pc.numCpu >= 85) {
                crossIncidentsArray.push(`Device ${pc.pcId} (${branchName}) internal thermal core reached critical limit at ${pc.cpuTemp}. Ventilation check required.`);
                alerts.push(`<span style="background: var(--color-error)15; color: var(--color-error); padding: 4px var(--space-sm); border-radius: var(--radius-sm); display: inline-flex; align-items: center; gap: 4px; font-weight:var(--weight-semibold);"><span class="material-symbols-rounded" style="font-size:14px;">device_thermostat</span> THERMAL OVERHEAT (${pc.cpuTemp})</span>`);
            }

            if (pc.keyboard.toLowerCase() !== "working") {
                alerts.push(`<span style="background: var(--color-warning)15; color: var(--color-warning); padding: 4px var(--space-sm); border-radius: var(--radius-sm); display: inline-flex; align-items: center; gap: 4px; font-weight:var(--weight-semibold);"><span class="material-symbols-rounded" style="font-size:14px;">keyboard</span> Input Channel Error</span>`);
            }

            if (alerts.length === 0) {
                alerts.push(`<span style="background: var(--color-success)15; color: var(--color-success); padding: 4px var(--space-sm); border-radius: var(--radius-sm); display: inline-flex; align-items: center; gap: 4px; font-weight:var(--weight-semibold);"><span class="material-symbols-rounded" style="font-size:14px;">check_circle</span> Parameters Normal</span>`);
            }

            branchHtml += `
                <div style="background: var(--color-background); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-md); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: var(--space-md);">
                    <div style="display: flex; align-items: center; gap: var(--space-md);">
                        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${pc.status === 'healthy' ? 'var(--color-success)' : pc.status === 'warning' ? 'var(--color-warning)' : 'var(--color-error)'};"></div>
                        <div>
                            <div style="font-size: var(--text-sm); font-weight: var(--weight-bold);">${pc.pcId} <span style="font-weight: var(--weight-normal); color: var(--color-text-secondary);">— ${pc.user}</span></div>
                            <div style="font-size: var(--text-xs); color: var(--color-text-muted); margin-top: 2px;">Core Temp: ${pc.cpuTemp} | Storage Health: ${pc.storageHealth} (${pc.free} free / ${pc.capacity})</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: var(--space-xs); flex-wrap: wrap;">${alerts.join('')}</div>
                </div>`;
        });

        branchHtml += `</div></div></div></div>`;
        container.innerHTML += branchHtml;
    }

    // Display critical active environment alert box if anomalies found
    if (crossIncidentsArray.length > 0 && incidentWidget && incidentList) {
        incidentWidget.style.display = "block";
        crossIncidentsArray.forEach(msg => {
            const li = document.createElement("li");
            li.innerText = msg;
            incidentList.appendChild(li);
        });
    } else if (incidentWidget) {
        incidentWidget.style.display = "none";
    }
}