function displayUnits(units, el) {
  // Remove existing children of 'el'
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }

  // Remove existing elements with class 'fall-back'
  document
    .querySelectorAll(".fall-back")
    .forEach((fallback) => fallback.remove());

  // If no units, display a fallback message
  if (units.length === 0) {
    el.insertAdjacentHTML(
      "beforeend",
      `<h2 class="fall-back">No result to display</h2>`
    );
    return;
  }

  units.forEach((u) => {
    const unitHtml = `  
            <form method="POST" class="item unit-item relative" enctype="multipart/form-data">
              <i class="fas fa-ellipsis-v question-sub-menu-btn"></i>
              <ul class="question-list_item-sub-list">
        
                <li class="editForm question-list_item-sub-list-action">Edit</li>
                <li class="question-list_item-sub-list-action">
                  <a href="/teacher/units/delete/${u._id}">Delete</a>
                </li>
              </ul>


              <div class="item-img"style="height:40%">
                  <div class="tumbnialImage hidden">
                      <input accept="image/*" type="file" name="image" value="${
                        u.unitDetails.image
                      }"  class="item-inputs_control" id="${u._id}">
                      <label for="${u._id}" class="btn-3"></label>
                      <img  class="thum-img hidden">
                  </div>
                  <img src="/${
                    u.unitDetails.image || "/images/unitImage.jpg"
                  }" class="card-img-top">
              </div>

            
            <input type="hidden" class="hidden" name="unitId" value="${
              u._id
            }" />
            <div class="p-2">
                <div class="item_inputs_group">
                    <label for="${u.unitDetails.name}">Name</label>
                    <input 
                      class="item-inputs_control lead p-2 rounded w-100"
                      id="${u.unitDetails.name}"
                      type="text"
                      value="${u.unitDetails.name}"
                      name="updatedName"
                      disabled 
                      />
                </div>
                <div class="item_inputs_group">
                    <label for="${
                      u.unitInfo.id + u.unitInfo.grade
                    }" >Grade</label>
                    <input 
                      class="item-inputs_control lead p-2 w-100 rounded" 
                      min="0" 
                      id="${u.unitInfo.id + u.unitInfo.grade}"
                      type="number"
                      value="${u.unitInfo.grade}"
                      name="updatedGrade"
                      disabled 
                    />
                </div>
                <div class="item_inputs_group">
                    <label>Term</label>
                        <input class="item-inputs_control lead p-2 w-100 rounded" min="0" type="number" value="${
                          u.unitInfo.term
                        }" name="updatedTerm"
                    disabled />
                </div>

            <div class="flex gap-2">
                <button type="submit" class="btn btn-sm btn-success updatedBtn hidden">
                    Edit
                </button>
                <a class="btn btn-sm btn-info cancelBtn hidden">
                    Cancel
                </a>
            </div>
            <div class="item-actions">
                <a href="/teacher/units/${
                  u._id
                }" class="btn btn-sm btn-info inline-block">
                    Open
                </a>
            </div>
            </div>
        </form>
            `;
    el.insertAdjacentHTML("beforeend", unitHtml);
  });
}
