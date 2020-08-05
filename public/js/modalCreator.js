// export const createModal = (whichModal) => {
//   const modalContainer = document.createElement('div');
//   modalContainer.className = 'modal-container';

//   let returnedElement = null;

//   if (whichModal === 'user-registration') returnedElement = displayTheModal();

//   modalContainer.appendChild(returnedElement);
//   document.body.appendChild(modalContainer);
// };

export const displayTheModal = () => {
  const modalContainer = document.createElement('div');
  const modalCard = document.createElement('div');
  const profilePicContainer = document.createElement('div');
  const profilePic = document.createElement('img');
  const editBtnContainer = document.createElement('div');
  const editBtn = document.createElement('img');
  const profilePicturesOptionsContainer = document.createElement('div');
  const section = document.createElement('div');
  const label = document.createElement('label');
  const labelContent = document.createElement('span');
  const nameInput = document.createElement('input');
  const alertMsg = document.createElement('div');
  const doneBtn = document.createElement('button');

  modalContainer.className = 'modal-container';
  modalCard.className = 'modal-card';

  profilePicContainer.className = 'profile-pic-container';
  profilePic.className = 'profile-pic';
  editBtnContainer.className = 'profile-photo-edit-btn-container';
  editBtn.className = 'profile-photo-edit-btn';
  profilePicturesOptionsContainer.className =
    'profile-picture-options-container hidden-class';
  section.className = 'name-section';
  nameInput.className = 'name-input';
  label.className = 'name-label';
  labelContent.className = 'label-content';
  alertMsg.className = 'alert-msg';
  doneBtn.className = 'done-btn';

  // Add the svg profile pics
  for (var i = 1; i <= 10; i++) {
    const profilePictureOptionImage = document.createElement('img');

    profilePictureOptionImage.className = 'profile-picture-option-image';
    profilePictureOptionImage.id = `profile-pic-${i}`;
    profilePictureOptionImage.src = `./../profile-pics/${i}.svg`;
    profilePictureOptionImage.alt = 'Profile Picture';

    profilePicturesOptionsContainer.appendChild(profilePictureOptionImage);
  }

  // Customizing the elements
  profilePic.src = './../profile-pics/0.svg';
  profilePic.setAttribute('img-number', 'profile-pic-0');
  profilePic.id = 'profile-pic';
  editBtn.src = './../svg/camera.svg';

  nameInput.type = 'text';
  nameInput.name = 'username';
  nameInput.minLength = 2;
  nameInput.maxLength = 18;
  nameInput.placeholder = 'What do you want to be called';

  nameInput.addEventListener('keypress', (e) => {
    if (e.charCode === 13 || e.which === 13) {
      doneBtn.click();
    }
  });

  label.for = 'username';
  labelContent.textContent = 'Username';

  doneBtn.textContent = 'Done';

  // Adding event listener for edit image options container
  profilePicturesOptionsContainer.addEventListener('click', (e) => {
    const targetElement = e.target;

    if (targetElement.tagName === 'IMG') {
      profilePic.src = targetElement.src;
      profilePic.setAttribute('img-number', targetElement.id);
    }
  });

  // Adding event listener for camera profile pic edit btn to toggle the options
  editBtnContainer.addEventListener('click', () => {
    profilePicturesOptionsContainer.classList.toggle('hidden-class');
  });

  // Appending the elements
  label.appendChild(labelContent);

  section.appendChild(nameInput);
  section.appendChild(label);

  editBtnContainer.appendChild(editBtn);
  profilePicContainer.appendChild(profilePic);
  profilePicContainer.appendChild(editBtnContainer);

  modalCard.appendChild(profilePicturesOptionsContainer);
  modalCard.appendChild(profilePicContainer);
  modalCard.appendChild(section);
  modalCard.appendChild(alertMsg);
  modalCard.appendChild(doneBtn);

  // return modalCard;
  modalContainer.appendChild(modalCard);
  document.body.appendChild(modalContainer);

  return true;
};
