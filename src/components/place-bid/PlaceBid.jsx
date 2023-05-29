import { arrayUnion, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import { AuthContext } from '../../contexts/Auth.context';
import { useContext, useState } from 'react';
import { StyledInput, StyledSubmitButton } from './styles';

const PlaceBid = ({
	itemId,
	highestBid,
	currentPrice,
	highestBidder,
	bids
}) => {
	const { loggedUser } = useContext(AuthContext);
	const [bid, setBid] = useState('');

	return (
		<form
			onSubmit={e =>
				handleSubmit(
					e,
					itemId,
					Number(bid.replace(/,/g, '.')),
					Number(highestBid),
					Number(currentPrice),
					highestBidder,
					bids,
					loggedUser.email,
					setBid
				)
			}
		>
			<StyledInput
				type='text'
				name='bid'
				id='bid'
				value={bid}
				onChange={e => setBid(e.target.value)}
			/>
			<StyledSubmitButton>Pujar</StyledSubmitButton>
		</form>
	);
};

const updateAuction = async (
	id,
	newPrice,
	newHighestBid,
	newHighestBidder,
	setBid,
	newBids
) => {
	const itemToUpdate = doc(db, 'items', id);
	const userToUpdate = doc(db, 'users', newHighestBidder);
	try {
		await updateDoc(itemToUpdate, {
			currentPrice: newPrice,
			highestBid: newHighestBid,
			highestBidder: newHighestBidder,
			bids: newBids
		});
		await updateDoc(userToUpdate, { myAuctions: arrayUnion(id) });
		console.log('Puja confirmada');
		setBid('');
	} catch (err) {
		console.error('Error al actualizar el documento', err);
	}
};

const handleSubmit = async (
	e,
	id,
	bid,
	highestBid,
	currentPrice,
	highestBidder,
	bids,
	email,
	setBid
) => {
	e.preventDefault();
	console.log('bid: ' + bid);
	let newPrice = currentPrice;
	let newHighestBid = highestBid;
	let newHighestBidder = highestBidder;
	const newBids = Number(bids) + 1;

	// Invalid
	if (bid < currentPrice) {
		console.log('Bid must be higher than current price');
		return;
	}

	// First bidder
	if (highestBid === 0) {
		// console.log('First bidder');
		// newHighestBid = bid;
		// newPrice = currentPrice;
		// newHighestBidder = email;
		updateAuction(id, currentPrice, bid, email, setBid, newBids);
		// updateAuction(id, newPrice, newHighestBid, newHighestBidder, setBid);
		return;
	}

	// Bidder wins
	if (bid > highestBid) {
		console.log('You are the highest bidder');
		newHighestBid = bid;
		newHighestBidder = email;
		if (highestBid + 1 > bid) {
			console.log('cannot add 1');
			newPrice = bid;
		} else {
			console.log('add 1');
			newPrice = highestBid + 1;
		}
		updateAuction(
			id,
			newPrice,
			newHighestBid,
			newHighestBidder,
			setBid,
			newBids
		);
		return;
	}

	// Bidder is overbid by previous user
	if (bid <= highestBid) {
		console.log('You have been outbid');
		newHighestBid = highestBid;
		newHighestBidder = highestBidder;
		if (bid + 1 > highestBid) {
			console.log('cannot add 1');
			newPrice = highestBid;
		} else {
			console.log('add 1');
			newPrice = bid + 1;
		}
		updateAuction(
			id,
			newPrice,
			newHighestBid,
			newHighestBidder,
			setBid,
			newBids
		);
		return;
	}

	// Invalid bid
	console.log('Invalid bid');
};

export default PlaceBid;
