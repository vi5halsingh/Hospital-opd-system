document.addEventListener('DOMContentLoaded', function() {
    var firstContent = document.getElementById('content1');
   if(firstContent) firstContent.classList.add('active');
});

function showContent(contentNumber) {
    var contents = document.querySelectorAll('.sidebar-content');
    contents.forEach(function(content) {
        content.classList.remove('active');
    });

    var selectedContent = document.getElementById('content' + contentNumber);
    selectedContent.classList.add('active');
}
function searchAppointment() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("searchInput");
    filter = input.value.toUpperCase();
    table = document.querySelector(".profile-appointment-list table");
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td");
        for (var j = 0; j < td.length; j++) {
            if (td[j]) {
                txtValue = td[j].textContent || td[j].innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                    break;
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }
}

function searchRecord() {
    var input2, filter, table, tr, td, i, txtValue;
    input2 = document.getElementById("recordsearchInput");
    filter = input2.value.toUpperCase();
    table = document.querySelector(".patient-record");
    tr = table.getElementsByTagName("tr");

    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td");
        for (var j = 0; j < td.length; j++) {
            if (td[j]) {
                txtValue = td[j].textContent || td[j].innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].style.display = "";
                    break;
                } else {
                    tr[i].style.display = "none";
                }
            }
        }
    }
}

function acceptAppointment(element) {
    updateAppointmentStatus(element, 'accepted');
}

function declineAppointment(element) {
    updateAppointmentStatus(element, 'declined');
}

function addToWaitlist(element) {
    updateAppointmentStatus(element, 'waitlisted');
}
function updateAppointmentStatus(element, newStatus) {
    const appointmentId = element.closest('tr').getAttribute('data-appointment-id');
    const socket = io();

    fetch(`/api/user/appointments/${appointmentId}/updateStatus`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const appointmentRow = document.querySelector(`#appointment-${appointmentId}`);
            
            if (newStatus !== 'new') {
                const newParent = document.querySelector('#patient-records-body');
                const oldParent = document.querySelector('#new-appointments-body');
                
                if (oldParent && appointmentRow) {
                    oldParent.removeChild(appointmentRow);
                    if (newParent) {
                        newParent.appendChild(appointmentRow);
                    }
                }
                
                if (appointmentRow) {
                    appointmentRow.querySelector('td:nth-child(3)').innerHTML = newStatus;
                }

                // Emit socket event for real-time update
                socket.emit('status-update', {
                    appointmentId,
                    status: newStatus,
                    doctorId: document.querySelector('[data-doctor-id]').dataset.doctorId
                });
            }
        }
    })
    .catch(error => console.error('Error:', error));
}

document.getElementById('logout')?.addEventListener('click', function() {
    const userconfirm = confirm("Do you want to Log Out")
    if(userconfirm){
        localStorage.removeItem('token');  
        fetch('/api/user/logout', {
          method: 'POST'
        }).then(response => {
          if (response.ok) {
            window.location.href = '/';
          }
        }).catch(error => {
          console.error('Logout failed:', error);
        });
        
    }
});



document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin.js loaded and DOM ready');
    
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.sidebar');
    const closedMenu = document.querySelector('.close');
    const openedMenu = document.querySelector('.open');

    console.log('Hamburger elements found:', {
        hamburger: !!hamburger,
        sidebar: !!sidebar,
        closedMenu: !!closedMenu,
        openedMenu: !!openedMenu
    });

    if (hamburger && sidebar) {
        hamburger.addEventListener('click', function(event) {
            console.log('Hamburger clicked');
            event.stopPropagation();
            
            if (sidebar.classList.contains('active')) {
                console.log('Closing sidebar');
                if (closedMenu) closedMenu.style.display = 'block';
                if (openedMenu) openedMenu.style.display = 'none';
                sidebar.classList.remove('active');
            } else {
                console.log('Opening sidebar');
                if (closedMenu) closedMenu.style.display = 'none';
                if (openedMenu) openedMenu.style.display = 'block';
                sidebar.classList.add('active');
            }
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!sidebar.contains(event.target) && !hamburger.contains(event.target)) {
                if (sidebar.classList.contains('active')) {
                    if (closedMenu) closedMenu.style.display = 'block';
                    if (openedMenu) openedMenu.style.display = 'none';
                    sidebar.classList.remove('active');
                }
            }
        });
        
        // Close menu on window resize if it's a larger screen
        window.addEventListener('resize', function() {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('active');
                if (closedMenu && openedMenu) {
                    closedMenu.style.display = 'block';
                    openedMenu.style.display = 'none';
                }
            }
        });
    } else {
        console.error('Hamburger menu elements not found');
    }
});

