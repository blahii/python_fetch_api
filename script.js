function fetchAndDisplayProjects(page = 1, perPage = 24, searchQuery = '', selectedRegions = [],  selectedStatus = [],selectedPriorities = [], selectedAreas = [], selectedFurnishings = []) {
    
    let apiURL = `https://squid-app-bjn57.ondigitalocean.app/projects?page=${page}&perPage=${perPage}`;
    if (searchQuery) {
        apiURL += `&search=${encodeURIComponent(searchQuery)}`;
    }
    if (selectedRegions.length > 0) {
        apiURL += `&regions=${encodeURIComponent(selectedRegions.join(','))}`;
    }
    if (selectedFurnishings.length > 0) {
        apiURL += `&furnishing=${encodeURIComponent(selectedFurnishings.join(','))}`;
    }
    if (selectedAreas.length > 0) {
        apiURL += `&area=${encodeURIComponent(selectedAreas.join(','))}`;
    }
    if (selectedPriorities.length > 0) {
        apiURL += `&priority=${encodeURIComponent(selectedPriorities.join(','))}`;
    }
    if (selectedStatus.length > 0) {
        apiURL += `&status=${encodeURIComponent(selectedStatus.join(','))}`;
    }

    history.pushState(
        { page: page },
        `Page ${page}`,
        `?page=${page}${searchQuery ? `&search=${encodeURIComponent(searchQuery)}` : ''}${selectedRegions.length > 0 ? `&regions=${encodeURIComponent(selectedRegions.join(','))}` : ''}${selectedPriorities.length > 0 ? `&priority=${encodeURIComponent(selectedPriorities.join(','))}` : ''}${selectedAreas.length > 0 ? `&area=${encodeURIComponent(selectedAreas.join(','))}` : ''}${selectedFurnishings.length > 0 ? `&furnishing=${encodeURIComponent(selectedFurnishings.join(','))}` : ''}${selectedStatus.length > 0 ? `&status=${encodeURIComponent(selectedStatus.join(','))}` : ''}`
    );    
    fetch(apiURL)
        .then(response => response.json())
        .then(data => {
            console.log('Полученные данные:', data);
            const totalCountElement = document.getElementById('total-count');
            totalCountElement.innerHTML = `${data.totalCount}`;

            const container = document.getElementById('cards-properties');
            container.innerHTML = '';
            if (data.projects && Array.isArray(data.projects)) {
                data.projects.forEach(project => {
                    let priceText;
    if (project.Price_from_AED > 0) {
        const formattedPrice = Number(project.Price_from_AED).toLocaleString('en-US'); 
        priceText = `AED ${formattedPrice}`;
    } else if (project.Price_from_AED === 0 && project.Status === "Out of stock") {
        priceText = "Out of stock";
    } else {
        priceText = "Contact for price";
    }
                    const projectCard = document.createElement('div');
                    projectCard.classList.add('project-card');
                
                    projectCard.innerHTML = `
                        <a class="project-card w-inline-block">
                            <div class="project-image" style="background-image: url('${project.Cover_URL}');">
                                <div class="commision_box">
                                    <div class="commision-text-box">
                                        <div class="_5-comission">${project.Priority}</div>
                                    </div>
                                </div>
                                <div class="commision_box purple hidden">
                                    <div class="commision-text-box">
                                        <div class="_5-comission"></div>
                                    </div>
                                </div>
                            </div>
                            <div class="name_object_block">
                                <div class="project-info-box">
                                    <div class="project-name">${project.Project_name}</div>
                                    <div class="area-developer-wrapper">
                                        <div class="project-area">${project.Area_name}</div>
                                        <div class="project-area-devider">-</div>
                                        <div class="project-area .developer">${project.Developers_name}</div>
                                    </div>
                                </div>
                                <div class="line-project-horizontal"></div>
                                <div class="div-block-18">
                                    <div class="price-box">
                                    <div class="price-value">${priceText}</div> <!-- Використання змінної priceText тут -->
                                    </div>
                                    <div class="line-vertically"></div>
                                    <div class="update-box">
                                        <div class="date-of-update">${project.Completion_date}</div>
                                    </div>
                                </div>
                            </div>
                        </a>
                    `;
                    container.appendChild(projectCard);
                });
             const totalPages = Math.ceil(data.totalCount / perPage);
             const pageInfoElement = document.getElementById('page-info');
             pageInfoElement.innerHTML = `${page}/${totalPages}`; // Update the page info display
         } else {
             console.error('Expected projects to be an array but got:', data.projects);
         }
     })
     .catch(error => {
         console.error('Error fetching projects:', error);
        });
}
document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const perPage = 24;
    const params = new URLSearchParams(window.location.search);
    const pageFromURL = parseInt(params.get('page'), 10) || 1;
    const searchFromURL = params.get('search') || '';
    const selectedRegions = Array.from(document.querySelectorAll('[name="regions"]:checked'))
    .map(cb => cb.getAttribute('valueRegion'));
    const selectedPriorities = Array.from(document.querySelectorAll('[name="priority"]:checked'))
    .map(cb => cb.getAttribute('valuePriority'));
    const selectedStatus = Array.from(document.querySelectorAll('[name="status"]:checked'))
    .map(cb => cb.getAttribute('valueStatus'));
    const selectedAreas = Array.from(document.querySelectorAll('[name="area"]:checked'))
    .map(cb => cb.getAttribute('valueAreas'));
     const selectedFurnishings = Array.from(document.querySelectorAll('[name="furnishing"]:checked'))
    .map(cb => cb.getAttribute('valueFurnishings'));
    fetchAndDisplayProjects(currentPage, perPage, searchQuery, selectedStatus, selectedRegions,selectedPriorities, developerName, selectedAreas, selectedFurnishings);

    
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');
    const searchInput = document.getElementById('searchInput');
    const searchDevInput = document.getElementById('searchInput');
    const furnishingCheckboxes = document.querySelectorAll('[name="furnishing"]');
    const regionCheckboxes = document.querySelectorAll('[name="regions"]');
    const statusCheckboxes = document.querySelectorAll('[name="status"]');
    const priorityCheckboxes = document.querySelectorAll('[name="priority"]');
    const areaCheckboxes = document.querySelectorAll('[name="area"]');
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage -= 1;
            const developerName = document.getElementById('developerInput') ? document.getElementById('developerInput').value : '';
            const searchQuery = document.getElementById('searchInput') ? document.getElementById('searchInput').value : '';
            fetchAndDisplayProjects(currentPage, perPage, searchQuery, selectedStatus, selectedRegions,selectedPriorities, developerName, selectedAreas, selectedFurnishings);
        }
    });
    
    nextButton.addEventListener('click', () => {
        currentPage += 1;
        const developerName = document.getElementById('developerInput') ? document.getElementById('developerInput').value : '';
        const searchQuery = document.getElementById('searchInput') ? document.getElementById('searchInput').value : '';
        fetchAndDisplayProjects(currentPage, perPage, searchQuery,  selectedStatus, selectedRegions,selectedPriorities, developerName, selectedAreas, selectedFurnishings);
    });
    searchInput.addEventListener('input', () => {
        const searchQuery = searchInput.value.trim();
        currentPage = 1;
        fetchAndDisplayProjects(currentPage, perPage, searchQuery, selectedStatus, selectedRegions, selectedPriorities, selectedAreas,   selectedFurnishings);
    });
    regionCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const selectedRegions = Array.from(regionCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.getAttribute('valueRegion'));
                console.log('Selected Regions:', selectedRegions);
            currentPage = 1;
            fetchAndDisplayProjects(currentPage, perPage, searchInput.value.trim(), selectedStatus, selectedRegions, selectedPriorities, selectedAreas,  selectedFurnishings);
        });
    });

    statusCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const selectedStatus = Array.from(statusCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.getAttribute('valueStatus'));
            console.log('Selected Status:', selectedStatus);
            currentPage = 1; // Reset to the first page upon filter change
            fetchAndDisplayProjects(currentPage, perPage, searchInput.value.trim(), selectedStatus, selectedRegions, selectedPriorities, selectedAreas, selectedFurnishings);
        });
    });

    priorityCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const selectedPriorities = Array.from(priorityCheckboxes)
                .filter(cb => cb.checked)
                .map(cb => cb.getAttribute('valuePriority'));
                console.log('Selected Priorities:', selectedPriorities);
            currentPage = 1;
            fetchAndDisplayProjects(currentPage, perPage, searchInput.value.trim(), selectedRegions,selectedPriorities, selectedAreas,  selectedFurnishings);
        });
    });
areaCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        const selectedAreas = Array.from(areaCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.value);
        currentPage = 1;
        fetchAndDisplayProjects(currentPage, perPage, searchInput.value.trim(), selectedRegions, selectedPriorities, selectedAreas, selectedFurnishings);
    });
});
});
