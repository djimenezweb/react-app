import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/Auth.context';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import MiniItem from '../../components/mini-item/MiniItem';
import { StyledContainer } from './styles';
import { MESSAGES } from '../../constants/messages';

const MyItems = () => {
	const { loggedUser } = useContext(AuthContext);
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const today = new Date();

	useEffect(() => {
		if (!loggedUser) return;
		getItemsByEmail(loggedUser.email, setItems, setLoading);
	}, [loggedUser]);

	if (loading) return <p>{MESSAGES.loading}</p>;

	return (
		<>
			<h2>{MESSAGES.myItems}</h2>

			<div>
				{items.length === 0 && <p>{MESSAGES.nullItems}</p>}
				<StyledContainer>
					{items.map(item => (
						<MiniItem key={item.id} item={item} today={today} />
					))}
				</StyledContainer>
			</div>
		</>
	);
};

export default MyItems;

const getItemsByEmail = async (email, setItems, setLoading) => {
	try {
		const q = query(collection(db, 'items'), where('sellerEmail', '==', email));
		const querySnapshot = await getDocs(q);
		const data = [];
		querySnapshot.forEach(doc => {
			doc.data().title && data.push({ ...doc.data(), id: doc.id });
			console.log(data);
		});
		const orderedByEndDate = data.sort((a, b) => {
			if (a.endDate > b.endDate) return 1;
			if (a.endDate < b.endDate) return -1;
			return 0;
		});
		setItems(orderedByEndDate);
		setLoading(false);
	} catch (err) {
		console.error(err);
	}
};
