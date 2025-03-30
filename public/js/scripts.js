// Esperar a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM cargado - Inicializando scripts")

  // Inicializar tooltips de Bootstrap
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  tooltipTriggerList.map((tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl))

  // Inicializar popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
  popoverTriggerList.map((popoverTriggerEl) => new bootstrap.Popover(popoverTriggerEl))

  // Cerrar automáticamente las alertas después de 5 segundos
  setTimeout(() => {
    const alerts = document.querySelectorAll(".alert:not(.alert-permanent)")
    alerts.forEach((alert) => {
      const bsAlert = new bootstrap.Alert(alert)
      bsAlert.close()
    })
  }, 5000)

  // Validación de formularios
  const forms = document.querySelectorAll(".needs-validation")
  Array.prototype.slice.call(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
        form.classList.add("was-validated")
      },
      false,
    )
  })

  // Actualizar total en tiempo real en el formulario de nueva orden
  const serviciosCheckboxes = document.querySelectorAll('input[name="serviciosIds"]')
  const totalElement = document.getElementById("total")

  if (serviciosCheckboxes.length > 0 && totalElement) {
    serviciosCheckboxes.forEach((checkbox) => {
      checkbox.addEventListener("change", actualizarTotal)
    })

    function actualizarTotal() {
      let total = 0
      serviciosCheckboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          const precio = Number.parseFloat(checkbox.getAttribute("data-precio") || 0)
          total += precio
        }
      })
      totalElement.textContent = total.toFixed(2)
    }
  }

  // Animación para elementos con la clase fade-in
  const fadeElements = document.querySelectorAll(".fade-in")
  fadeElements.forEach((element) => {
    element.style.opacity = "1"
  })

  console.log("Scripts inicializados correctamente")
})

  
  