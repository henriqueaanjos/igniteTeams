import { Alert, FlatList, View } from "react-native";
import { useCallback, useState } from "react";
import { useNavigation, useFocusEffect } from "@react-navigation/core";

import { 
    Container,
    Title 
} from "./styles";
import { Header } from "@components/Header";
import { Highlight } from "@components/Highlight";
import { GroupCard } from "@components/GroupCard";
import { ListEmpty } from "@components/ListEmpty";
import { Button } from "@components/Button";
import { groupGetAll } from "@storage/group/groupGetAll";
import { Loading } from "@components/Loading";



export function Groups() {
    const [isLoading, setIsLoading] = useState(true);
    const [groups, setGroups] = useState<string[]>([]);
    const navigation = useNavigation();

    function handleNewGroup(){
        navigation.navigate('new');
    }

    async function fetchGroups(){
        try {
            setIsLoading(true);
            const data = await groupGetAll();
            setGroups(data);
        } catch (error) {
            console.log(error);
            Alert.alert('Turmas', 'Não foi possivel carregar as turmas.')
        }finally{
            setIsLoading(false);
        }
    }

    function handleOpenGroup(group: string){
        navigation.navigate('players', { group });
    }

    useFocusEffect(useCallback(() => {
        fetchGroups(); 
    }, []));

    return(
        <Container>
            <Header/>
            <Highlight
                title="Turmas"
                subtitle="jogue com a sua turma"
            />
            {
                isLoading ? <Loading/> :
                
                <FlatList
                    data={groups}
                    keyExtractor={key => key}
                    renderItem={({item}) =>
                        <GroupCard 
                            title={item}
                            onPress={() => handleOpenGroup(item)}
                        />
                    }
                    contentContainerStyle={groups.length === 0 && { flex:1}}
                    ListEmptyComponent={() => <ListEmpty message="Que tal cadastrar a primeira turma?"/>}
                />
            }
            <Button 
                title="Criar nova turma"
                onPress={handleNewGroup}
            />
        </Container>
    );
}
