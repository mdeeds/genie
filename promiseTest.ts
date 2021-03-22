function resolveSlowly(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('A'); // 2
    setTimeout(resolve, 100);
    console.log('B');  // 3
  })
}

function resolveZero(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('C');  // 5
    setTimeout(resolve, 0);
    console.log('D');  // 6
  })
}

function resolveImmediately(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('E');  // 8
    resolve();
    console.log('F');  // 9
  })
}

function go() {
  console.log('G');  // 1
  resolveSlowly().then((() => { console.log('H'); }));  // 14
  console.log('I');  // 4
  resolveZero().then((() => { console.log('J'); }));  // 13
  console.log('K');  // 7
  resolveImmediately().then((() => { console.log('L'); }));  // 12
  console.log('M');  // 10
}

console.log('N');  // 0
go();
console.log('O');  // 11