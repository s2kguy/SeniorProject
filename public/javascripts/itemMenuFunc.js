var FormStuff = {
    console.log("itemMenuFunc.js");
    
    init: function() {
      this.applyConditionalRequired();
      this.bindUIActions();
    },
    
    bindUIActions: function() {
      $("input[type='radio']").on("change", this.applyConditionalRequired);
    },
    
    applyConditionalRequired: function() {
      
      $(".require-if-active").each(function() {
        var el = $(this);
        if ($(el.data("require-pair")).is(":checked")) {
          el.prop("required", true);
        } else {
          el.prop("required", false);
        }
      });
      
    }
    
  };
  
  FormStuff.init();