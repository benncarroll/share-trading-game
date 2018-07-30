function summonModal(modalTitle, modalBody, dataInput, modalButton) {
  // modalFooter = modalFooter || "";
  dataInput = dataInput || false;
  modalButton = modalButton || "Close";
  $("#modifiableModal-title").text(modalTitle)
  $("#modifiableModal-body").html(modalBody)
  $("#modifiableModal-button").text(modalButton)
  if (modalButton == "Load") {
    $("#modifiableModal-button").on("click", function(){ importSaveData(1, $("#modifiableModal-dataInput").val()); });
  } else {
    $("#modifiableModal-button").off("click")
  }

  if (dataInput==true) {
    $("#modifiableModal-dataInput").show()
  } else {
    $("#modifiableModal-dataInput").hide()
  }
  // $("#modifiableModal-footer").text(modalFooter)

  $("#modifiableModal").modal()

}

function summonNewsArticle(index) {
  a = eventsData[index]
  $("#eventModal-title").text(a.__title)
  $("#eventModal-body").html(a.__body)
  $("#eventModal-source").text(a.__source)
  $("#eventModal-summary").html(a.__summary)
  $("#eventModal").modal()
}
