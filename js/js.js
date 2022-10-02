const cards = document.getElementById("cards");
const items = document.getElementById("items");
const footer= document.getElementById("footer");
const templateCard = document.getElementById("template-card").content;
const templateFooter = document.getElementById("template-footer").content;
const templateCarrito = document.getElementById("template-carrito").content;
const fragment = document.createDocumentFragment();
let carrito = {};

document.addEventListener("DOMContentLoaded", () => {
    fetchData()
    if (localStorage.getItem("carrito")){
        carrito = JSON.parse(localStorage.getItem("carrito"));
        pintarCarrito();
    }
});

cards.addEventListener("click", (e) =>{
    addCarrito(e);
});

items.addEventListener("click", e =>{
    btnAccion(e);
});

const fetchData = async () => {
    try {
        const res = await fetch('../json/api.json')
        const data = await res.json()
        pintarCards(data)
    } catch (error){
        console.log(error)
    }
};


function pintarCards  (data){
    data.forEach(producto =>{
        templateCard.querySelector("h5").textContent = producto.nombre;
        templateCard.querySelector("p").textContent = producto.precio;
        templateCard.querySelector("img").setAttribute("src", producto.img);
        templateCard.querySelector(".btn-dark").dataset.id = producto.id;

        const clone = templateCard.cloneNode(true);
        fragment.appendChild(clone);
    }) 
    cards.appendChild(fragment);
}

function addCarrito (e) {
    if (e.target.classList.contains("btn-dark")){
        SetCarrito(e.target.parentElement);
    }
    e.stopPropagation()
};

function SetCarrito (objeto){ 
    const producto = {
        id: objeto.querySelector(".btn-dark").dataset.id,
        nombre: objeto.querySelector("h5").textContent, 
        precio: objeto.querySelector("p").textContent,
        cantidad: 1
    }

    if (carrito.hasOwnProperty(producto.id)){
        producto.cantidad = carrito[producto.id].cantidad + 1;
    }

    carrito[producto.id] = {...producto}
    toastifyPos();
    pintarCarrito();
};

function pintarCarrito() {
    items.innerHTML = "";
    Object.values(carrito).forEach( producto => {
        templateCarrito.querySelector("th").textContent = producto.id;
        templateCarrito.querySelectorAll("td")[0].textContent = producto.nombre;
        templateCarrito.querySelectorAll("td")[1].textContent = producto.cantidad;
        templateCarrito.querySelector(".btn-info").dataset.id = producto.id;
        templateCarrito.querySelector(".btn-danger").dataset.id = producto.id;
        templateCarrito.querySelector("span").textContent = producto.cantidad*producto.precio;
        const clone = templateCarrito.cloneNode(true);
        fragment.appendChild(clone);
    })
    items.appendChild(fragment);

    pintarFooter();
    localStorage.setItem("carrito", JSON.stringify(carrito));
}

function pintarFooter () {
    footer.innerHTML = "";
    if (Object.keys(carrito).length === 0){
        footer.innerHTML = `<th scope="row" colspan="5">Carrito vacío - comience a comprar!</th>`
        return
    } 

    const nCantidad = Object.values(carrito).reduce((acc, {cantidad})=> acc+cantidad,0);
    const nPrecio = Object.values(carrito).reduce((acc, {cantidad, precio})=> acc + cantidad*precio,0);

    templateFooter.querySelectorAll("td")[0].textContent = nCantidad;
    templateFooter.querySelector("span").textContent = nPrecio;

    const clone = templateFooter.cloneNode(true);
    fragment.appendChild(clone);
    footer.appendChild(fragment);

    const btnVaciar = document.getElementById("vaciar-carrito");
    btnVaciar.addEventListener("click", ()=>{
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger'
            },
            buttonsStyling: false
        })
        swalWithBootstrapButtons.fire({
            title: 'Estas seguro?',
            text: "Estas a punto de eliminar todos los productos del carrito",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si, vaciar carrito',
            cancelButtonText: 'No, salvar carrito!',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                swalWithBootstrapButtons.fire(
                'Eliminado!',
                'Se vació el carrito correctamente',
                'success'
            );
            carrito = {};
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            swalWithBootstrapButtons.fire(
                'Accion cancelada',
                'Se guardó el carrito, podes continuar con tu compra',
                'error'
            )}
        })
        pintarCarrito();
        })
}

function btnAccion (e) {
    if (e.target.classList.contains("btn-info")){
        const producto = carrito[e.target.dataset.id];
        producto.cantidad++;
        carrito [e.target.dataset.id] = {...producto};
        toastifyPos()
        pintarCarrito();
    }
    if (e.target.classList.contains("btn-danger")){
        const producto = carrito[e.target.dataset.id];
        producto.cantidad--;
        producto.cantidad === 0 ? delete carrito[e.target.dataset.id] : false;
        toastifyNeg();
        pintarCarrito();

    }
    e.stopPropagation();
}

function toastifyNeg (){
    Toastify({
        text: "Borraste una unidad",
        style:{
            color: "black",
            background:"#f5c3b6"
        }, 
        duration: 2000
        
        }).showToast();
}
function toastifyPos (){
    Toastify({
        text: "Agregaste una unidad",
        style:{
            color: "black",
            background:"#e0ffe3"
        }, 
        duration: 2000
        
        }).showToast();
}
