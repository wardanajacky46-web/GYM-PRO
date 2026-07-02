const memberTableBody = document.getElementById('memberTableBody');
const addMemberBtn = document.getElementById('addMemberBtn');
const memberFormContainer = document.getElementById('memberFormContainer');
const memberForm = document.getElementById('memberForm');
const formTitle = document.getElementById('formTitle');
const cancelMemberBtn = document.getElementById('cancelMemberBtn');
const memberIndexInput = document.getElementById('memberIndex');
const memberOriginalIdInput = document.getElementById('memberOriginalId');
const apiBase = '/api/members';

async function fetchMembers() {
  const response = await fetch(apiBase);
  if (!response.ok) {
    throw new Error('Gagal memuat data member');
  }
  return response.json();
}

function formatDate(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function createRow(member, index) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td><img src="${member.photo}" alt="Foto ${member.name}"></td>
    <td>${member.id}</td>
    <td><a href="#">${member.name}</a></td>
    <td>${member.package}</td>
    <td>${formatDate(member.join_date)}</td>
    <td class="${member.status.toLowerCase()}">${member.status}</td>
    <td class="table-actions">
      <button type="button" class="btn btn-small btn-edit" data-id="${member.id}">Edit</button>
      <button type="button" class="btn btn-small btn-delete" data-id="${member.id}">Delete</button>
    </td>
  `;
  return row;
}

async function renderMembers() {
  try {
    const members = await fetchMembers();
    memberTableBody.innerHTML = '';

    if (members.length === 0) {
      memberTableBody.innerHTML = '<tr><td colspan="7" class="empty-row">Belum ada member. Tambahkan member baru.</td></tr>';
      return;
    }

    members.forEach((member) => {
      memberTableBody.appendChild(createRow(member));
    });

    document.querySelectorAll('.btn-edit').forEach((button) => {
      button.addEventListener('click', () => editMember(button.dataset.id));
    });

    document.querySelectorAll('.btn-delete').forEach((button) => {
      button.addEventListener('click', () => deleteMember(button.dataset.id));
    });
  } catch (error) {
    memberTableBody.innerHTML = '<tr><td colspan="7" class="empty-row">Gagal memuat data member.</td></tr>';
    console.error(error);
  }

  members.forEach((member, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><img src="${member.photo}" alt="Foto ${member.name}"></td>
      <td>${member.id}</td>
      <td><a href="#">${member.name}</a></td>
      <td>${member.package}</td>
      <td>${formatDate(member.joinDate)}</td>
      <td class="${member.status.toLowerCase()}">${member.status}</td>
      <td class="table-actions">
        <button type="button" class="btn btn-small btn-edit" data-index="${index}">Edit</button>
        <button type="button" class="btn btn-small btn-delete" data-index="${index}">Delete</button>
      </td>
    `;
    memberTableBody.appendChild(row);
  });

  document.querySelectorAll('.btn-edit').forEach((button) => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index, 10);
      editMember(index);
    });
  });

  document.querySelectorAll('.btn-delete').forEach((button) => {
    button.addEventListener('click', () => {
      const index = parseInt(button.dataset.index, 10);
      deleteMember(index);
    });
  });
}

function showForm(mode, member = null, originalId = null) {
  formTitle.textContent = mode === 'create' ? 'Tambah Member Baru' : 'Edit Member';
  memberForm.reset();
  memberIndexInput.value = mode === 'edit' ? originalId : '';
  memberOriginalIdInput.value = mode === 'edit' ? originalId : '';

  if (member) {
    document.getElementById('photo').value = member.photo;
    document.getElementById('memberId').value = member.id;
    document.getElementById('name').value = member.name;
    document.getElementById('package').value = member.package;
    document.getElementById('joinDate').value = member.join_date;
    document.getElementById('status').value = member.status;
  }

  memberFormContainer.classList.add('active');
}

function hideForm() {
  memberFormContainer.classList.remove('active');
  memberForm.reset();
  memberIndexInput.value = '';
}

async function editMember(id) {
  try {
    const members = await fetchMembers();
    const member = members.find((item) => item.id === id);
    if (!member) return;
    showForm('edit', member, id);
  } catch (error) {
    console.error('Gagal mengambil member untuk edit:', error);
  }
}

async function deleteMember(id) {
  if (!confirm(`Hapus member dengan ID ${id}?`)) {
    return;
  }

  try {
    const response = await fetch(`${apiBase}/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Gagal menghapus member.');
    }
    renderMembers();
  } catch (error) {
    console.error(error);
    alert('Gagal menghapus member. Cek konsol untuk detail.');
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();

  const photo = document.getElementById('photo').value.trim() || 'images/placeholder.png';
  const id = document.getElementById('memberId').value.trim();
  const name = document.getElementById('name').value.trim();
  const packageValue = document.getElementById('package').value;
  const joinDate = document.getElementById('joinDate').value;
  const status = document.getElementById('status').value;
  const originalId = memberOriginalIdInput.value;

  if (!id || !name || !joinDate || !status) {
    alert('Lengkapi semua data member sebelum menyimpan.');
    return;
  }

  const payload = {
    id,
    name,
    photo,
    package: packageValue,
    join_date: joinDate,
    status
  };

  try {
    const isEdit = Boolean(originalId);
    const url = isEdit ? `${apiBase}/${originalId}` : apiBase;
    const method = isEdit ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Gagal menyimpan member.');
    }

    hideForm();
    renderMembers();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

addMemberBtn.addEventListener('click', () => showForm('create'));
cancelMemberBtn.addEventListener('click', hideForm);
memberForm.addEventListener('submit', handleFormSubmit);

renderMembers();
