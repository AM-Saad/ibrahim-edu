/*jslint browser: true*/

/*global console, alert, $, jQuery*/

(function () {
  const units = {
    allUnits: [],
    unitimg: null,
    filteredUnits: [],
    init: function () {
      this.fetchAllUnit();
    },
    cashDom: function () {
      this.el = document.getElementById("teacher-units");
      this.gradeBtn = document.querySelectorAll(".filter-grade-item input");
      this.termDiv = document.getElementById("filter-term");
      this.termBtn = document.querySelectorAll(".filter-term-item input");
      this.sectionBtn = document.querySelectorAll(".filter-section-item input");
      this.searchname = document.querySelector(".search-name");
    },
    bindEvents: function () {
      this.gradeBtn.forEach((btn) =>
        btn.addEventListener("click", this.filterGrade.bind(this))
      );
      this.termBtn.forEach((btn) =>
        btn.addEventListener("click", this.filterTerm.bind(this))
      );
      this.sectionBtn.forEach((btn) =>
        btn.addEventListener("click", this.filterSection.bind(this))
      );
      document
        .querySelectorAll(".editForm")
        .forEach((btn) => btn.addEventListener("click", this.editForm));
      this.searchname.addEventListener("keyup", this.searchByName.bind(this));

      document.body.addEventListener(
        "change",
        function (e) {
          if (e.target.closest(".tumbnialImage input")) {
            this.displayEditedUnitImage(e);
          }
        }.bind(this)
      );
      document.body.addEventListener(
        "submit",
        function (e) {
          if (e.target.closest(".unit-item")) {
            e.preventDefault(); // Prevent form submission
            this.saveUnit(e);
          }
        }.bind(this)
      );
    },
    fetchAllUnit: async function () {
      $(".loading").removeClass("hidden");
      const data = await fetchdata(`/teacher/api/units`, "get", {}, true);
      if (data) {
        this.allUnits = data.json.units;
        this.cashDom();
        displayUnits(this.allUnits, this.el);
        this.bindEvents();
      }
      $(".loading").addClass("hidden");
    },
    filterGrade: function (e) {
      const grade = e.target.value;
      this.gradeBtn.forEach((btn) => btn.removeAttribute("checked"));
      document
        .querySelectorAll('input[name="term"]')
        .forEach((btn) => (btn.checked = false));
      document
        .querySelectorAll('input[name="section"]')
        .forEach((btn) => (btn.checked = false));

      e.target.setAttribute("checked", true);

      if (grade === "all") return displayUnits(this.allUnits, this.el);

      const gradeUnits = this.allUnits.filter((u) => u.unitInfo.grade == grade);
      this.filteredUnits = gradeUnits;
      displayUnits(gradeUnits, this.el);
    },
    filterTerm: function (e) {
      const term = e.target.value;
      let termUnits;
      const allChecked = document.getElementById("all").checked;
      if (allChecked) {
        termUnits = this.allUnits.filter((u) => u.unitInfo.term == term);
      } else {
        termUnits = this.filteredUnits.filter((u) => u.unitInfo.term == term);
      }
      displayUnits(termUnits, this.el);
    },
    filterSection: function (e) {
      const section = e.target.value;
      document
        .querySelectorAll('input[name="term"]')
        .forEach((btn) => (btn.checked = false));

      let sectionUnits = this.allUnits.filter(
        (u) => u.unitInfo.section == section
      );
      this.filteredUnits = sectionUnits;
      displayUnits(sectionUnits, this.el);
    },
    searchByName: function (event) {
      var str = event.target.value.toLowerCase();
      document
        .querySelectorAll('input[type="radio"]')
        .forEach((btn) => (btn.checked = false));

      if (this.isEmptyOrSpaces(str)) {
        document.getElementById("all").checked = true;
        return displayUnits(this.allUnits, this.el);
      }
      var filteredArr = this.allUnits.filter((i) => {
        var xSub = i.unitDetails.name.toLowerCase();
        return (
          i.unitDetails.name.toLowerCase().includes(str) ||
          this.checkName(xSub, str)
        );
      });
      displayUnits(filteredArr, this.el);
    },
    checkName: (name, str) => {
      var pattern = str
        .split("")
        .map((x) => {
          return `(?=.*${x})`;
        })
        .join("");
      var regex = new RegExp(`${pattern}`, "g");
      return name.match(regex);
    },

    displayEditedUnitImage: function (e) {
      let photo = e.target.files[0]; // file from input
      if (e.target.files && e.target.files[0]) {
        var reader = new FileReader();
        const tumbnialImage = e.target.parentElement.querySelector(".thum-img");
        reader.onload = function (e) {
          units.unitimg = e.target.result;
          tumbnialImage.src = e.target.result;
        };
        reader.readAsDataURL(e.target.files[0]);
        tumbnialImage.classList.remove("hidden");
      }
    },
    editForm: function (e) {
      e.preventDefault();

      let form = e.target.closest("form");
      console.log(form);

      let inputs = form.querySelectorAll("input");
      inputs.forEach((input) => input.removeAttribute("disabled"));

      let selects = form.querySelectorAll("select");
      selects.forEach((select) => select.removeAttribute("disabled"));

      let itemActions = form.querySelector(".item-actions");
      itemActions.classList.add("hidden");

      let tumbnialImage = form.querySelector(".tumbnialImage");
      tumbnialImage.classList.remove("hidden");

      let updatedBtn = form.querySelector(".updatedBtn");
      updatedBtn.classList.remove("hidden");

      let cancelBtn = form.querySelector(".cancelBtn");
      cancelBtn.classList.remove("hidden");

      cancelBtn.addEventListener("click", function (e) {
        e.preventDefault();
        inputs.forEach((input) => input.setAttribute("disabled", true));
        selects.forEach((select) => select.setAttribute("disabled", true));
        itemActions.classList.remove("hidden");
        updatedBtn.classList.add("hidden");
        cancelBtn.classList.add("hidden");
        tumbnialImage.classList.add("hidden");

        let thumImg = form.querySelector(".thum-img");
        if (thumImg) {
          thumImg.classList.add("hidden");
          thumImg.src = "";
        }
      });
    },
    saveUnit: async function (e) {
      e.preventDefault();
      const data = this.getData(e.target);
      const valid = this.validateInputs(data);

      if (valid) {
        e.target.style.opacity = 0.8;
        e.target.classList.add("loader-effect");
        let newForm = this.createForm(data);
        const res = await fetchdata(
          `/teacher/api/units/${data.unitId}`,
          "put",
          newForm,
          false
        );
        if (res !== null) {
          message("Unit Updated", "success", "body");
          e.target.querySelector(".cancelBtn").click();
          document.querySelector(".thum-img").classList.add("hidden").src = "";

          e.target.style.opacity = 1;
          this.updateExistUnit(data);
          if (this.unitimg) {
            document
              .querySelector(`input[value="${data.unitId}"]`)
              .closest("form")
              .querySelector(".card-img-top").src = this.unitimg;
          }
          e.target.classList.remove("loader-effect");
        }
      }
    },
    getData: function (form) {
      const formData = new FormData(form);
      return {
        unitId: formData.get("unitId"),
        updatedName: formData.get("updatedName"),
        updatedGrade: formData.get("updatedGrade"),
        updatedTerm: formData.get("updatedTerm"),
        updatedimage: form.querySelector(".tumbnialImage input").files,
        updatedSection: formData.get("updatedSection"),
      };
    },
    validateInputs: function (data) {
      if (this.isEmptyOrSpaces(data.updatedName))
        return message("name is required", "warning", "body");
      if (this.isEmptyOrSpaces(data.updatedGrade))
        return message("grade is required", "warning", "body");
      if (this.isEmptyOrSpaces(data.updatedTerm))
        return message("term is required", "warning", "body");
      return true;
    },
    createForm: function (data) {
      const newForm = new FormData();
      newForm.append("updatedName", data.updatedName);
      newForm.append("updatedGrade", data.updatedGrade);
      newForm.append("updatedTerm", data.updatedTerm);
      newForm.append("updatedSection", data.updatedSection);

      if (data.updatedimage.length > 0)
        newForm.append("image", data.updatedimage[0]);
      return newForm;
    },
    isEmptyOrSpaces: (str) => str === null || str.match(/^ *$/) !== null,
    updateExistUnit: function (e, data) {
      console.log("here");

      // Find and update inputs in the form
      const form = e.target.closest("form");
      const updatedNameInput = form.querySelector('input[name="updatedName"]');
      if (updatedNameInput) updatedNameInput.value = data.updatedName;

      const updatedGradeInput = form.querySelector(
        'input[name="updatedGrade"]'
      );
      if (updatedGradeInput) updatedGradeInput.value = data.updatedGrade;

      const updatedTermInput = form.querySelector('input[name="updatedTerm"]');
      if (updatedTermInput) updatedTermInput.value = data.updatedTerm;

      // Update the allUnits array
      const index = this.allUnits.findIndex(
        (u) => u._id.toString() === data.unitId.toString()
      );
      if (index >= 0) {
        this.allUnits[index].unitDetails.name = data.updatedName;
        this.allUnits[index].unitInfo.grade = data.updatedGrade;
        this.allUnits[index].unitInfo.term = data.updatedTerm;
      }
    },
  };

  units.init();
})();
