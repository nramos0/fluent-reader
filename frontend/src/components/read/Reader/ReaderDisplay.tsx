import ReaderSidebar from '../ReaderSidebar/ReaderSidebar';
import ReadPages from '../ReadPages/ReadPages';

const ReaderDisplay: React.FC<{
    pages: string[][];
    wordIndexMap: Dictionary<number[]>;
}> = ({ pages, wordIndexMap }) => {
    return (
        <>
            <ReadPages pages={pages} wordIndexMap={wordIndexMap} />
            <ReaderSidebar />
        </>
    );
};

export default ReaderDisplay;
