export default function SumofArray(array) {
    return array?.reduce((acc, curr) => acc + Number(curr || 0), 0);
}