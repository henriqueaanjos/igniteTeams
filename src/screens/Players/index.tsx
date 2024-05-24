
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, TextInput } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
    Container, Form, HeaderList, NumberOfPlayer,
} from './styles';

import { Highlight } from '@components/Highlight';
import { ButtonIcon } from '@components/ButtonIcon';
import { Input } from '@components/Input';
import { Header } from '@components/Header';
import { Filter } from '@components/Filter';
import { PlayerCard } from '@components/PlayerCard';
import { ListEmpty } from '@components/ListEmpty';
import { Button } from '@components/Button';

import { AppError } from '@utils/AppError';

import { playerAddByGroup } from '@storage/player/playerAddByGroup';
import { playersGetByGroup } from '@storage/player/playersGetByGroup';
import { playersGetByGroupAndTeam } from '@storage/player/playerGetByGroupAndTeam';
import { PlayerStorageDTO } from '@storage/player/PlayerStorageDTO';
import { playerRemoveByGroup } from '@storage/player/playerRemoveByGroup';
import { groupRemoveByName } from '@storage/group/groupRemoveByName';
import { Loading } from '@components/Loading';

type RouteParams = {
    group: string
}

export function Players(){
    const [isLoading, setIsLoading] = useState(true);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [team, setTeam] = useState('Time A');
    const [players, setPlayers] = useState<PlayerStorageDTO[]>([]);

    const newPlayerNameInputRef = useRef<TextInput>(null);

    const route = useRoute();
    const { group } = route.params as RouteParams;

    const navigation = useNavigation();

    async function removeGroup(){
        try {
            await groupRemoveByName(group);
            navigation.navigate('groups');
        } catch (error) {
            console.log(error);
            Alert.alert('Remover Turma', 'Não foi possivel remover a turma.')
        }
    }

    async function handleRemoveGroup(){
        Alert.alert(
            'Remover',
            'Deseja remover a turma?',
            [{
                text: 'Não',
                style: 'cancel'
            },{
                text: 'Sim',
                onPress: removeGroup
            }]
        )
    }

    async function handleRemovePlayer(playerName: string){
        try {
            await playerRemoveByGroup(playerName, group);
            fetchPlayerByTeam();
        } catch (error) {
            console.log(error);
            Alert.alert('Remover Pessoa', 'Não foi possivel remover essa pessoa.')
        }
    }
    
    async function handleAddPlayer(){
        if(newPlayerName.trim().length === 0){
            return Alert.alert('Nova Pessoa', 'Informe o nome da pessoa para adicionar.');
        }
        const newPlayer = {
            name: newPlayerName,
            team,
        }
        try {
            await playerAddByGroup(newPlayer, group);
            newPlayerNameInputRef.current?.blur();
            setNewPlayerName('');
            fetchPlayerByTeam();
        } catch (error) {
            if(error instanceof AppError){
                Alert.alert('Nova Pessoa', error.message)
            }else{
                console.log(error);
                Alert.alert('Nova Pessoa', 'Não foi possível adicionar');
            }
        }
    }

    async function fetchPlayerByTeam(){
        try {
            setIsLoading(true);
            const playerByTeam = await playersGetByGroupAndTeam(group, team);
            setPlayers(playerByTeam);
        } catch (error) {
            console.log(error);
            Alert.alert('Pessoas', 'Não foi possivel carregar as pessoas do time selecionado');
        }finally{
            setIsLoading(false);
        }
    }

    useEffect(() => {

        fetchPlayerByTeam();
    }, [team]);

    return(
        <Container>
            <Header showBackButton/>
            <Highlight title={group} subtitle='adicione a galera e separe os times' />
            <Form>
                <Input 
                    inputRef={newPlayerNameInputRef}
                    placeholder='Nome da pessoa'
                    autoCorrect={false}
                    onChangeText={setNewPlayerName}
                    value={newPlayerName}
                    onSubmitEditing={handleAddPlayer}
                    returnKeyType='done'
                />
                <ButtonIcon 
                    icon='add' 
                    onPress={handleAddPlayer}
                />
            </Form>
            <HeaderList>
                <FlatList
                    data={['Time A', 'Time B']}
                    keyExtractor={ key => key}
                    renderItem={({ item }) => (
                        <Filter
                            title={item}
                            isActive={item === team}
                            onPress={() => setTeam(item)}
                        />
                    )}
                    horizontal
                />
                <NumberOfPlayer>{players.length}</NumberOfPlayer>
            </HeaderList>
            {
                isLoading ? <Loading/> :
            
                <FlatList
                    data={players}
                    keyExtractor={item => item.name}
                    renderItem={({ item }) => (
                        <PlayerCard 
                            name={item.name}
                            onRemove={() => handleRemovePlayer(item.name)}
                        />
                    )}
                    ListEmptyComponent={() => <ListEmpty message="Não há pessoas nesse time!"/>}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        {paddingBottom: 100},
                        players.length === 0 && { flex:1 }
                    ]}
                />
            }
            <Button 
                title='Remover turma' 
                type='SECONDARY'
                onPress={handleRemoveGroup}
            />
        </Container>
    );
}