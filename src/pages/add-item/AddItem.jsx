import { useContext, useRef, useState } from 'react';

// Firebase
import { arrayUnion, doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase.config';
import { AuthContext } from '../../contexts/Auth.context';
import { v4 } from 'uuid';

const AddItem = () => {
	const INITIAL_STATE = {
		title: '',
		startingPrice: 1,
		duration: 1,
		description: ''
	};
	const inputFileRef = useRef(null);
	const { loggedUser } = useContext(AuthContext);
	const [newItem, setNewItem] = useState(INITIAL_STATE);

	return (
		<>
			<h2>Crear anuncio</h2>
			<form
				onSubmit={e =>
					handleSubmit(e, newItem, loggedUser, setNewItem, INITIAL_STATE)
				}
			>
				<div>
					<label htmlFor='title'>Título</label>
					<input
						type='text'
						name='title'
						id='title'
						value={newItem.title}
						onChange={e =>
							handleChange(newItem, setNewItem, 'title', e.target.value)
						}
					/>
				</div>
				<div>
					<label htmlFor='startingPrice'>Precio de salida</label>
					<input
						type='number'
						name='startingPrice'
						id='startingPrice'
						value={newItem.startingPrice}
						onChange={e =>
							handleChange(newItem, setNewItem, 'startingPrice', e.target.value)
						}
					/>{' '}
					€
				</div>
				<div>
					<label htmlFor='duration'>Duración</label>
					<select
						name='duration'
						id='duration'
						value={newItem.duration}
						onChange={e =>
							handleChange(newItem, setNewItem, 'duration', e.target.value)
						}
					>
						<option value='1'>1 día</option>
						<option value='3'>3 días</option>
						<option value='5'>5 días</option>
						<option value='7'>1 semana</option>
					</select>
					<p>
						La subasta terminará el {printDate(newItem.duration)} a las{' '}
						{printTime()}
					</p>
				</div>
				<div>
					<label htmlFor='description'>Descripción</label>
					<textarea
						name='description'
						id='description'
						value={newItem.description}
						onChange={e =>
							handleChange(newItem, setNewItem, 'description', e.target.value)
						}
					></textarea>
				</div>
				<div>
					<input type='file' ref={inputFileRef} name='picture0' id='picture0' />
					<div onClick={() => handleInputFileClick(inputFileRef)}>
						AÑADIR ARCHIVO
					</div>
				</div>
				<div>
					<button type='reset' onClick={() => setNewItem(INITIAL_STATE)}>
						Borrar
					</button>
					<button>Publicar anuncio</button>
				</div>
			</form>
		</>
	);
};

export default AddItem;

const handleInputFileClick = inputFileRef => {
	inputFileRef.current.click();
};

const handleChange = (newItem, setNewItem, key, value) => {
	setNewItem({
		...newItem,
		[key]: value
	});
};

const handleSubmit = async (
	e,
	newItem,
	loggedUser,
	setNewItem,
	INITIAL_STATE
) => {
	e.preventDefault();
	const today = new Date();
	const endDate = new Date();
	endDate.setDate(endDate.getDate() + Number(newItem.duration));
	const id = v4();
	const userToUpdate = doc(db, 'users', loggedUser.email);
	try {
		await setDoc(doc(db, 'items', id), {
			...newItem,
			sellerEmail: loggedUser.email,
			sellerID: loggedUser.uid,
			currentPrice: newItem.startingPrice,
			highestBid: 0,
			highestBidder: '',
			creationDate: today.toISOString(),
			endDate: endDate.toISOString()
		});
		await updateDoc(userToUpdate, { myItems: arrayUnion(id) });
		setNewItem(INITIAL_STATE);
	} catch (err) {
		console.error(err);
	}
};

const printDate = duration => {
	const dateToPrint = new Date();
	dateToPrint.setDate(dateToPrint.getDate() + Number(duration));
	return dateToPrint.toLocaleDateString('es-ES', { dateStyle: 'full' });
};

const printTime = duration => {
	const timeToPrint = new Date();
	return timeToPrint.toLocaleTimeString('es-ES', {
		timeStyle: 'short'
	});
};
