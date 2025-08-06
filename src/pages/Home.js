import React, { useContext } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';
import { ChatContext } from '../context/ChatContext';

const Home = () => {
  const { data } = useContext(ChatContext);
  const isChatSelected = data.chatId;

  return (
    <div className='home vh-100 d-flex align-items-center justify-content-center' style={{ backgroundColor: '#f0f2f5' }}>
      <Container fluid className='h-100 p-0 m-0'>
        <Row className='h-100 no-gutters'>
          {/* Sidebar Column */}
          <Col 
            xs={12} 
            md={4} 
            className={`d-flex flex-column ${isChatSelected ? 'd-none d-md-flex' : ''}`}
            style={{ borderRight: '1px solid #e0e0e0', backgroundColor: '#ffffff' }}
          >
            <Sidebar />
          </Col>

          {/* Chat Column */}
          <Col 
            xs={12} 
            md={8} 
            className={`d-flex flex-column ${!isChatSelected ? 'd-none d-md-flex' : ''}`}
          >
            <Chat />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Home;
