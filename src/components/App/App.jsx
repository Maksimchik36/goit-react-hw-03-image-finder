import { Component } from "react";
import { Container } from "./App.styled";
import Searchbar from "components/Searchbar";
import ImageGallery from "components/ImageGallery";
import Button from "components/Button";
import Modal from "components/Modal";
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import { BallTriangle } from 'react-loader-spinner';
import * as ImageService from '../../service/image-service';

class App extends Component {
  state = {
    query: '',
    images: [], 
    page: 1,
    isEmpty: false, // пустой ли массив получаем при запросе
    isVisible: false, // видимость Button LoadMore
    isLoading: false, // для визуализации загрузки - спинера
    error: null, // сообщение об ошибке - в catch
    largeImageURL: '', // картинка для модалки
  };


  // componentDidUpdate(prevProps, prevState) - если один из параметровне исп-ем, пишем символ "_", чтобы валидатор не ругался
  componentDidUpdate(_, prevState){
    const {query, page, } = this.state;
    
    if (prevState.query !== query || prevState.page !== page) {
      this.getPhotos(query, page);
    }
  }


  // получение коллекции элементов
  getPhotos = async (query, page) => {
    if(!query){
      console.log("Введите Ваш запрос");
      return;
    }
    // начало загрузки
    this.setState({isLoading:true})

    try {
      const {totalHits, hits}  = await ImageService.getImages(query, page);
      
      if (hits.length === 0) {
        this.setState({ isEmpty: true });
        console.log("isEmpty: true");
        return;
      }
      
      this.setState(prevState => ({
        images: [...prevState.images, ...hits],
        isVisible: Math.ceil(totalHits/hits.length) > page,

      }))
      
    }
    catch (error) {
      this.setState({error: error.message})
    }
    finally {
      // завершение загрузки
      this.setState({isLoading:false})
    }
  }

  // перезаписывает значение state в App
  onSubmit = (query) => {
    this.setState({
      query,
      images:[],
      page: 1,
      isEmpty: false,
      isVisible: false,
      })
  }

  // при нажатии на кнопку значение текущей страницы увеличивается
  onLoadMoreBtnClick = () => {
   this.setState(prevState => ({page: prevState.page + 1}))    
  }

  // при нажатии на картинку возвращает объект данных выбранной картинки  
  onImageClick = (e) => {
    const selectedImageSrc = e.target.src;
    const selectedImage = this.state.images.find(el=>el.webformatURL === selectedImageSrc);
    this.setState({largeImageURL: selectedImage.largeImageURL})
 }

 onModalClose = (e) => {
  console.log(e.target);
 }

  render() {
    const { isEmpty, images, isVisible, error, isLoading, largeImageURL } = this.state;

    return (
      <Container>        
        <Searchbar onSubmit={this.onSubmit}> </Searchbar>
        {isEmpty && <>Sorry. There are no images ... 😭</>}
        
        {error && <>❌ Something went wrong - {error}</>}
        
        <ImageGallery
            onClick={this.onImageClick}
            images={images}>         
        </ImageGallery>
        
        {isVisible && <Button message="Load More" onClick={this.onLoadMoreBtnClick}></Button>}
        
        {isLoading && <BallTriangle color="#00BFFF" height={80} width={80} />}

        {largeImageURL && <Modal image={this.state.largeImageURL} onClose={this.onModalClose} ></Modal>}
        
      </Container>
  );
  }
};


export default App;