window.addEventListener("load", function(event) {
    var app = wuf.VueJS('#app',()=>{
        document.querySelector('body').setAttribute('style',''); //Smooth fadein to prevent ugly placeholders at load
    });
});