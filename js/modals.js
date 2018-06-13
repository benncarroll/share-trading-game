function summonModal(modalTitle, modalBody, modalFooter) {
  modalFooter = modalFooter || "";
  $("#modifiableModal-title").text(modalTitle)
  $("#modifiableModal-body").html(modalBody)
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
