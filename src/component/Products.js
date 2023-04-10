import React from 'react'

import axios from 'axios';
import { Card, Accordion, Button, Container, Row, Col, Image, Input, list } from 'react-bootstrap';


const products = [
    { name: "Apples", country: "Italy", cost: 3, instock: 10 },
    { name: "Oranges", country: "Spain", cost: 4, instock: 3 },
    { name: "Beans", country: "USA", cost: 2, instock: 5 },
    { name: "Cabbage", country: "USA", cost: 1, instock: 8 },
  ];
  //=========Cart=============
  const Cart = (props) => {
    
    let data = props.location.data ? props.location.data : products;
    console.log(`data:${JSON.stringify(data)}`);
  
    return <Accordion defaultActiveKey="0">{}</Accordion>;
  };
  
  const useDataApi = (initialUrl, initialData) => {
    const { useState, useEffect, useReducer } = React;
    const [url, setUrl] = useState(initialUrl);
  
    const [state, dispatch] = useReducer(dataFetchReducer, {
      isLoading: false,
      isError: false,
      data: initialData,
    });
    console.log(`useDataApi called`);
    useEffect(() => {
      console.log("useEffect Called");
      let didCancel = false;
      const fetchData = async () => {
        dispatch({ type: "FETCH_INIT" });
        try {
          const result = await axios(url);
          console.log("FETCH FROM URl");
          if (!didCancel) {
            dispatch({ type: "FETCH_SUCCESS", payload: result.data });
          }
        } catch (error) {
          if (!didCancel) {
            dispatch({ type: "FETCH_FAILURE" });
          }
        }
      };
      fetchData();
      return () => {
        didCancel = true;
      };
    }, [url]);
    return [state, setUrl];
  };
  const dataFetchReducer = (state, action) => {
    switch (action.type) {
      case "FETCH_INIT":
        return {
          ...state,
          isLoading: true,
          isError: false,
        };
      case "FETCH_SUCCESS":
        return {
          ...state,
          isLoading: false,
          isError: false,
          data: action.payload,
        };
      case "FETCH_FAILURE":
        return {
          ...state,
          isLoading: false,
          isError: true,
        };
      default:
        throw new Error();
    }
  };
  
  const Products = (props) => {
    const [items, setItems] = React.useState(products);
    const [cart, setCart] = React.useState([]);
    const [total, setTotal] = React.useState(0);
  
    //  Fetch Data
    const { Fragment, useState, useEffect, useReducer } = React;
    const [query, setQuery] = useState("http://localhost:1337/api/products");
    const [{ data, isLoading, isError }, doFetch] = useDataApi(
      "http://localhost:1337/api/products",
      {
        data: [],
      }
    );
    console.log(`Rendering Products ${JSON.stringify(data)}`);
    // Fetch Data
    const addToCart = (e) => {
      let name = e.target.name;
      let item = items.filter((item) => item.name == name);
      if (item[0].instock == 0) return;
      item[0].instock = item[0].instock - 1;
      console.log(`add to Cart ${JSON.stringify(item)}`);
      setCart([...cart, ...item]);
    };
    const deleteCartItem = (delIndex) => {
      // this is the index in the cart not in the Product List
  
      let newCart = cart.filter((item, i) => delIndex != i);
      let target = cart.filter((item, index) => delIndex == index);
      let newItems = items.map((item, index) => {
        if (item.name == target[0].name) item.instock = item.instock + 1;
        return item;
      });
      setCart(newCart);
      setItems(newItems);
    };
    const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];
  
    let list = items.map((item, index) => {
      let n = index + 1049;
      let uhit = "https://source.unsplash.com/random/800x800/?img=" + n;
    
      return (
        <li className="products" key={index}>
          <div className="productTitle">{item.name} ${item.cost}</div>
          <Image src={uhit} width={70} roundedCircle className="avatar" />
          <button
            className="btn btn-success"
            name={item.name}
            type="button"
            onClick={addToCart}
          >
            Add to Cart
          </button>
          <p className="stock">Stock on hand {item.instock} pcs from {item.country}</p>
        </li>
      );
    });
    
    let {cartList, totalQuantity} = cart.reduce((acc, item) => {
      const existingItem = acc.cartList.find((i) => i.name === item.name);
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.itemCost = existingItem.quantity * existingItem.cost;
      } else {
        let n = items.findIndex((i) => i.name === item.name) + 1049;
        let uhit = "https://source.unsplash.com/random/800x800/?img=" + n;
        let itemCost = item.cost;
        acc.cartList.push({ ...item, quantity: 1, uhit, itemCost });
      }
    
      acc.totalQuantity += 1;
    
      return acc;
    }, {cartList: [], totalQuantity: 0});
    
    cartList = cartList.map((item, index) => {
      return (
        <Card key={index}>
          <div>
            <div className="cartItemwrapper">
              <Image
                src={item.uhit}
                width={70}
                roundedCircle
                className="avatar"
              />
              <span className="item-name">{item.name} (Qty {item.quantity}) {" "}</span>
              <span className="item-cost">Total: ${item.itemCost}</span>
              <button
                type="button"
                className="checkout-btn"
                onClick={() => deleteCartItem(index)}
                eventKey={1 + index}
              >
                X
              </button>
              
            </div>
          </div>
        </Card>
      );
    });
    
    
    
  
    let finalList = () => {
      let total = checkOut();
      let quantity = cartList.reduce((acc, item) => acc + item.quantity, 0);
      let final = cart.map((item, index) => {
        return (
          <div key={index} index={index}>
            {item.name}
          </div>
        );
      });
      return { final, total, quantity };
    };
    
    
  
    const checkOut = () => {
      let costs = cart.map((item) => item.cost);
      const reducer = (accum, current) => accum + current;
      let newTotal = costs.reduce(reducer, 0);
      console.log(`total updated to ${newTotal}`);
      //cart.map((item, index) => deleteCartItem(index));
      return newTotal;
    };
    const restockProducts = (url) => {
      doFetch(url);
      let newItems = data.map((item) => {
        let { name, country, cost, instock } = item;
        return { name, country, cost, instock };
      });
      setItems([...items, ...newItems]);
    };

    const getTotalQuantity = (cart) => {
      return cart.reduce((total, item) => {
        return total + item.quantity;
      }, 0);
    };
  
    return (
      <div className="Container">
     

      <Container>
      <Row className="header">
          <form
            onSubmit={(event) => {
              restockProducts(`http://localhost:1337/api/${query}`);
              console.log(`Restock called on ${query}`);
              event.preventDefault();
            }}
          >
            <input
              className="input-control"
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button type="submit" class="btn btn-secondary">ReStock Products</button>
          </form>
        </Row>
        <Row>
          <Col>
           
            <Card>
            <Card.Header>Product List</Card.Header>
            <Card.Body>
            
            <ul class="list-group list-group-flush" style={{ listStyleType: "none" }}>
            <li class="list-group-item">{list}</li>
            
          </ul>

            </Card.Body>
          </Card>
          </Col>
         
           <Col>
          <Card>
            <Card.Header>Shopping Cart</Card.Header>
            <Card.Body>
            <ul class="list-group list-group-flush" style={{ listStyleType: "none" }}>
            <li class="list-group-item">{cartList}</li>
            </ul>
            </Card.Body>
          
            <div className="totalCost">
            <span className="totalItems">Total Items: {totalQuantity}</span>
              Cart Total:${finalList().total} 
              </div>
            
            <p>
               <Button className="checkoutButton" onClick={checkOut}>Checkout {" "}  
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cart" viewBox="0 0 16 16">
  <path d="M0 1.5A.5.5 0 0 1 .5 1H2a.5.5 0 0 1 .485.379L2.89 3H14.5a.5.5 0 0 1 .491.592l-1.5 8A.5.5 0 0 1 13 12H4a.5.5 0 0 1-.491-.408L2.01 3.607 1.61 2H.5a.5.5 0 0 1-.5-.5zM3.102 4l1.313 7h8.17l1.313-7H3.102zM5 12a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm7 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm-7 1a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm7 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
</svg>
               </Button></p>
          </Card>
        </Col>
          {/* <Col>
            <h1>CheckOut </h1>
            <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
            <div> {finalList().total > 0 && finalList().final} </div>
          </Col> */}
        </Row>
        
     
        

         

      </Container>
      </div>
    );
  };


export default Products;