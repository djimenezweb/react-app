// Firebase
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase.config';

// Router
import { useNavigate, useParams } from 'react-router-dom';

import { useContext, useEffect, useState } from 'react';
import Countdown from '../../components/countdown/Countdown';
import { AuthContext } from '../../contexts/Auth.context';
import PlaceBid from '../../components/place-bid/PlaceBid';
import AuctionStatus from '../../components/auction-status/AuctionStatus';
import DeleteItem from '../../components/delete-item/DeleteItem';
import {
	StyledActivePicture,
	StyledDot,
	StyledDotContainer,
	StyledGrid,
	StyledList,
	StyledListItem,
	StyledTitle
} from './styles';

const Item = () => {
	const { itemId } = useParams();
	const [item, setItem] = useState(null);
	const [activePicture, setActivePicture] = useState(0);
	const { loggedUser } = useContext(AuthContext);
	const navigate = useNavigate();

	useEffect(() => {
		const unsub = onSnapshot(doc(db, 'items', itemId), doc => {
			const response = doc.data();
			setItem(response);
		});

		return () => unsub();
	}, []);

	if (!item) return <p>Loading...</p>;

	return (
		<StyledGrid>
			{/* 			{item.pictures && (
				<div>
					<div>
						<StyledActivePicture src={item.pictures[activePicture]} />
					</div>
					<StyledThumbnailContainer>
						{item.pictures.map((picture, index) => {
							return (
								<StyledThumbnail
									key={`${itemId}-${index}`}
									onClick={() => setActivePicture(index)}
									src={picture}
									active={index === activePicture}
								/>
							);
						})}
					</StyledThumbnailContainer>
				</div>
			)} 
			<StyledId>ITEM {itemId}</StyledId>
			
			*/}

			{item.pictures && (
				<div>
					<div>
						<StyledActivePicture src={item.pictures[activePicture]} />
					</div>
					<StyledDotContainer>
						{item.pictures.map((picture, index) => {
							return (
								<StyledDot
									key={`${itemId}-${index}`}
									onClick={() => setActivePicture(index)}
									active={index === activePicture}
								/>
							);
						})}
					</StyledDotContainer>
				</div>
			)}
			<div>
				<StyledTitle>{item.title}</StyledTitle>
				<p>{item.description}</p>

				<StyledList>
					<StyledListItem>
						{Number(item.currentPrice).toLocaleString('es-ES', {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2
						})}{' '}
						€
					</StyledListItem>
					<StyledListItem>
						{item.bids} {Number(item.bids) === 1 ? 'puja' : 'pujas'}
					</StyledListItem>
				</StyledList>

				{/* Si HAY loggedUser y NO ES el vendedor, puede PUJAR */}
				{loggedUser?.email && loggedUser?.email !== item.sellerEmail && (
					<PlaceBid
						itemId={itemId}
						highestBid={item.highestBid}
						currentPrice={item.currentPrice}
						highestBidder={item.highestBidder}
						bids={item.bids}
					/>
				)}

				<p>Vendido por {item.sellerEmail}</p>
				<p>
					La subasta finaliza el {printDate(item.endDate)} a las{' '}
					{printTime(item.endDate)}
				</p>
				<Countdown endDate={item.endDate} />

				{/* Si NO HAY loggedUser se le pide que inicie sesión */}
				{!loggedUser?.email && <p>Inicia sesión para pujar</p>}

				{/* Si HAY loggedUser y NO ES el vendedor, puede PUJAR */}
				{loggedUser?.email && loggedUser?.email !== item.sellerEmail && (
					<>
						<PlaceBid
							itemId={itemId}
							highestBid={item.highestBid}
							currentPrice={item.currentPrice}
							highestBidder={item.highestBidder}
							bids={item.bids}
						/>
						<AuctionStatus
							highestBid={item.highestBid}
							highestBidder={item.highestBidder}
							endDate={item.endDate}
						/>
					</>
				)}

				{/* Si HAY loggedUser y ES el vendedor, puede EDITAR y BORRAR */}
				{loggedUser?.email && loggedUser?.email === item.sellerEmail && (
					<>
						<button onClick={() => navigate('edit', { state: item })}>
							Editar
						</button>
						<DeleteItem itemId={itemId} picturesArray={item.pictures} />
					</>
				)}

				<p style={{ opacity: 0.33 }}>
					<small>highestBid: {item.highestBid} €</small>
				</p>
				<p style={{ opacity: 0.33 }}>
					<small>highestBidder: {item.highestBidder}</small>
				</p>
			</div>
		</StyledGrid>
	);
};

const printDate = date => {
	const dateToPrint = new Date(date);
	return dateToPrint.toLocaleDateString('es-ES', { dateStyle: 'full' });
};

const printTime = date => {
	const timeToPrint = new Date(date);
	return timeToPrint.toLocaleTimeString('es-ES', {
		timeStyle: 'short'
	});
};

export default Item;
