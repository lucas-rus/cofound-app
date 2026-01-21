import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form } from 'react-bootstrap';
import { FiStar, FiAlertCircle } from 'react-icons/fi';
import api from '../api/axiosConfig';

const PendingReviews = () => {
  const [pending, setPending] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await api.get('/api/reviews/pending');
      setPending(res.data);
    } catch (e) {}
  };

  const handleOpen = (item) => {
    setSelectedReview(item);
    setForm({ rating: 5, comment: '' });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      await api.post('/api/reviews', {
        revieweeId: selectedReview.revieweeId,
        projectId: selectedReview.projectId,
        rating: form.rating,
        comment: form.comment
      });
      setShowModal(false);
      fetchPending();
    } catch (e) {
      alert("Failed to submit review");
    }
  };

  if (pending.length === 0) return null;

  return (
    <Card className="card-custom mb-4 border-warning">
      <Card.Header className="bg-warning bg-opacity-10 border-warning border-opacity-25 d-flex align-items-center gap-2">
        <FiAlertCircle className="text-warning"/>
        <span className="fw-bold text-dark">Pending Reviews</span>
      </Card.Header>
      <Card.Body>
        <p className="small text-muted mb-3">Please rate your teammates from completed or exited projects.</p>
        <div className="d-flex flex-column gap-2">
          {pending.map(p => (
            <div key={p.id} className="d-flex align-items-center justify-content-between p-2 bg-light rounded">
              <span className="small">Rate <strong>{p.revieweeName}</strong> for <em>{p.projectName}</em></span>
              <Button size="sm" variant="primary" onClick={() => handleOpen(p)}>Rate</Button>
            </div>
          ))}
        </div>
      </Card.Body>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Rate {selectedReview?.revieweeName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Rating</Form.Label>
                    <div className="d-flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <FiStar 
                                key={star} 
                                size={24} 
                                className={`cursor-pointer ${star <= form.rating ? "text-warning" : "text-muted"}`} 
                                style={{fill: star <= form.rating ? 'currentColor' : 'none', cursor: 'pointer'}}
                                onClick={() => setForm({...form, rating: star})}
                            />
                        ))}
                    </div>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Comment</Form.Label>
                    <Form.Control 
                        as="textarea" rows={3} 
                        value={form.comment}
                        onChange={(e) => setForm({...form, comment: e.target.value})}
                    />
                </Form.Group>
            </Form>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit}>Submit</Button>
        </Modal.Footer>
      </Modal>
    </Card>
  );
};

export default PendingReviews;
