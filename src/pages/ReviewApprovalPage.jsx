import { useEffect, useState } from 'react';
import ProgressStepper from '../components/ProgressStepper';
import { getReviewQueue, addReview } from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';

export default function ReviewApprovalPage() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);

    const [formData, setFormData] = useState({
        reviewer_name: '',
        decision: 'approved',
        comments: ''
    });

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);


    // =========================
    // LOAD REVIEW QUEUE
    // =========================
    useEffect(() => {

        if (!id) {

            getReviewQueue()
                .then(res => {

                    if (res.success) {
                        setQueue(res.data || []);
                    }

                })
                .catch(err => {
                    console.error('Review queue error:', err);
                })
                .finally(() => {
                    setLoading(false);
                });

        } else {

            setLoading(false);

        }

    }, [id]);


    // =========================
    // SUBMIT REVIEW
    // =========================
    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!id) {
            return;
        }

        if (
            (formData.decision === 'rework' ||
                formData.decision === 'rejected') &&
            !formData.comments.trim()
        ) {
            alert('Comments are required for Rework or Reject.');
            return;
        }

        setSubmitting(true);

        try {

            const response = await addReview({
                request_id: parseInt(id),
                reviewer_name: formData.reviewer_name,
                decision: formData.decision,
                comments: formData.comments
            });

            if (response.success) {

                setSuccess(true);

                setTimeout(() => {
                    navigate('/review/queue');
                }, 1500);

            } else {

                alert(response.message || 'Failed to submit review');

            }

        } catch (err) {

            console.error(err);
            alert('Error submitting review');

        } finally {

            setSubmitting(false);

        }
    };


    // =========================
    // QUEUE SCREEN
    // =========================
    if (!id) {

        if (loading) {
            return <Loader />;
        }

        return (
            <div className="flex flex-col h-full">

                <ProgressStepper />

                <div className="p-8">

                    <div className="mb-6">

                        <h2 className="text-2xl font-bold text-gray-800">
                            Review Queue
                        </h2>

                        <p className="text-gray-500 mt-1">
                            Requests waiting for Tech Lead approval.
                        </p>

                    </div>


                    <div className="bg-white rounded shadow border border-border-light overflow-hidden">

                        <table className="w-full text-left">

                            <thead>

                                <tr className="bg-gray-50 border-b">

                                    <th className="p-4 text-sm">
                                        Request ID
                                    </th>

                                    <th className="p-4 text-sm">
                                        Application
                                    </th>

                                    <th className="p-4 text-sm">
                                        Status
                                    </th>

                                    <th className="p-4 text-sm">
                                        Action
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {queue.map(request => (

                                    <tr
                                        key={request.id}
                                        className="border-b hover:bg-gray-50"
                                    >

                                        <td className="p-4 font-medium">
                                            #{request.id}
                                        </td>

                                        <td className="p-4">
                                            {request.application_id}
                                        </td>

                                        <td className="p-4">

                                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                                                {request.status}
                                            </span>

                                        </td>

                                        <td className="p-4">

                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/requests/${request.id}/review`
                                                    )
                                                }
                                                className="bg-button-orange hover:bg-hover-orange text-white px-4 py-2 rounded"
                                            >
                                                Review
                                            </button>

                                        </td>

                                    </tr>

                                ))}


                                {queue.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan="4"
                                            className="p-8 text-center text-gray-500"
                                        >
                                            No requests waiting for review.
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>
        );
    }


    // =========================
    // REVIEW FORM
    // =========================

    if (loading) {
        return <Loader />;
    }


    return (

        <div className="flex flex-col h-full">

            <ProgressStepper />

            <div className="p-8 max-w-2xl mx-auto w-full">

                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded shadow border border-border-light space-y-6"
                >

                    <h2 className="text-xl font-bold text-gray-800">
                        Submit Tech Lead Review
                    </h2>

                    <p className="text-sm text-gray-500">
                        Request ID: #{id}
                    </p>


                    {success && (

                        <div className="bg-green-50 text-green-700 p-4 rounded border border-green-200">
                            Review submitted successfully!
                            Redirecting to Review Queue...
                        </div>

                    )}


                    {/* Reviewer */}

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Reviewer Name
                        </label>

                        <input
                            required
                            type="text"
                            value={formData.reviewer_name}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    reviewer_name: e.target.value
                                })
                            }
                            className="w-full bg-input-bg border border-border-light rounded p-2"
                            placeholder="Enter reviewer name"
                        />

                    </div>


                    {/* Decision */}

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Decision
                        </label>

                        <div className="flex gap-6">

                            <label className="flex items-center gap-2">

                                <input
                                    type="radio"
                                    name="decision"
                                    value="approved"
                                    checked={formData.decision === 'approved'}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            decision: e.target.value
                                        })
                                    }
                                />

                                <span>
                                    Approve
                                </span>

                            </label>


                            <label className="flex items-center gap-2">

                                <input
                                    type="radio"
                                    name="decision"
                                    value="rework"
                                    checked={formData.decision === 'rework'}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            decision: e.target.value
                                        })
                                    }
                                />

                                <span>
                                    Request Rework
                                </span>

                            </label>


                            <label className="flex items-center gap-2">

                                <input
                                    type="radio"
                                    name="decision"
                                    value="rejected"
                                    checked={formData.decision === 'rejected'}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            decision: e.target.value
                                        })
                                    }
                                />

                                <span>
                                    Reject
                                </span>

                            </label>

                        </div>

                    </div>


                    {/* Comments */}

                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comments
                        </label>

                        <textarea
                            value={formData.comments}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    comments: e.target.value
                                })
                            }
                            rows="4"
                            className="w-full bg-input-bg border border-border-light rounded p-2"
                            placeholder="Required if rework or rejected..."
                        />

                    </div>


                    {/* Submit */}

                    <div className="pt-4 flex justify-end">

                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-button-orange hover:bg-hover-orange text-white px-8 py-2 rounded font-medium disabled:opacity-50"
                        >
                            {submitting
                                ? 'Submitting...'
                                : 'Submit Review'}
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );
}