import CharacterSection from "./CharacterSection";

interface UserPersonalitiesProps {
    onPersonalityPicked: (personalityIdPicked: string) => void;
    allPersonalities: IPersonality[];
    personalityIdState: string;
    languageState: string;
    disableButtons: boolean;
    selectedFilters: PersonalityFilter[];
    myPersonalities: IPersonality[];
}

const UserPersonalities: React.FC<UserPersonalitiesProps> = ({
    onPersonalityPicked,
    allPersonalities,
    personalityIdState,
    languageState,
    disableButtons,
    selectedFilters,
    myPersonalities,
}) => {
    return (
        <div className="flex flex-col gap-8 w-full">
            {myPersonalities.length > 0 && (
                <CharacterSection
                    selectedFilters={selectedFilters}
                    allPersonalities={myPersonalities}
                    languageState={languageState}
                    personalityIdState={personalityIdState}
                    onPersonalityPicked={onPersonalityPicked}
                    title={"Các nhân vật của tôi"}
                    disableButtons={disableButtons}
                />
            )}
        <CharacterSection
            allPersonalities={allPersonalities}
            languageState={languageState}
            personalityIdState={personalityIdState}
            onPersonalityPicked={onPersonalityPicked}
            title={"Các nhân vật"}
            disableButtons={disableButtons}
            selectedFilters={selectedFilters}
        />
        </div>

    );
};

export default UserPersonalities;
