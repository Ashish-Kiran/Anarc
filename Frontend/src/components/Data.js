// data.js
// Each entry is one team member card. `featured: true` on a member
// makes it render centered on its own row above the grid (use this
// for the president / lead card, like in the reference design).
//
// `image` should point to wherever you're serving photos from —
// e.g. `/team/aniket.jpg` if it's in your public folder, or an
// imported asset if you're bundling them.

const TEAM_MEMBERS = [
    {
      id: 'aniket-anand',
      name: 'Aniket Anand',
      role: 'ANARC President',
      image: '/team/aniket-anand.jpg',
      featured: true,
      socials: {
        linkedin: 'https://linkedin.com/in/aniket-anand',
        github: 'https://github.com/aniket-anand',
        instagram: 'https://instagram.com/aniket-anand',
      },
    },
    {
      id: 'kuppala-sarath-narendra',
      name: 'Kuppala Sarath Narendra',
      role: 'Technical Lead',
      image: '/team/kuppala-sarath-narendra.jpg',
      socials: {
        linkedin: 'https://linkedin.com/in/kuppala-sarath-narendra',
        github: 'https://github.com/kuppala-sarath-narendra',
        instagram: '',
      },
    },
    {
      id: 'manav-sengupta',
      name: 'Manav Sengupta',
      role: 'Embedded System Lead',
      image: '/team/manav-sengupta.jpg',
      socials: {
        linkedin: 'https://linkedin.com/in/manav-sengupta',
        github: 'https://github.com/manav-sengupta',
        instagram: '',
      },
    },
    {
      id: 'roushan-kumar',
      name: 'Roushan Kumar',
      role: 'Embedded System Co-Lead',
      image: '/team/roushan-kumar.jpg',
      socials: {
        linkedin: 'https://linkedin.com/in/roushan-kumar',
        github: 'https://github.com/roushan-kumar',
        instagram: '',
      },
    },
    {
      id: 'nainsi-raja-parmar',
      name: 'Nainsi Raja Parmar',
      role: 'Design & Media Lead',
      image: '/team/nainsi-raja-parmar.jpg',
      socials: {
        linkedin: '',
        github: '',
        instagram: 'https://instagram.com/nainsi-raja-parmar',
      },
    },
    {
      id: 'navanit-sharma',
      name: 'Navanit Sharma',
      role: 'Associate Design & Media Lead',
      image: '/team/navanit-sharma.jpg',
      socials: {
        linkedin: '',
        github: '',
        instagram: 'https://instagram.com/navanit-sharma',
      },
    },
    {
      id: 'tanisha-raj-v-rathore',
      name: 'Tanisha Raj V Rathore',
      role: 'Web Dev Lead',
      image: '/team/tanisha-raj-v-rathore.jpg',
      socials: {
        linkedin: 'https://linkedin.com/in/tanisha-raj-v-rathore',
        github: 'https://github.com/tanisha-raj-v-rathore',
        instagram: '',
      },
    },
    {
      id: 'naga-durga-hari-prasad-majji',
      name: 'Naga Durga Hari Prasad Majji',
      role: 'Event & Management Lead',
      image: '/team/naga-durga-hari-prasad-majji.jpg',
      socials: {
        linkedin: '',
        github: '',
        instagram: '',
      },
    },
    {
      id: 'sanjana-singh',
      name: 'Sanjana Singh',
      role: 'Associate Event Lead',
      image: '/team/sanjana-singh.jpg',
      socials: {
        linkedin: '',
        github: '',
        instagram: '',
      },
    },
    {
      id: 'aditi-das',
      name: 'Aditi Das',
      role: 'PR & Outreach Lead',
      image: '/team/aditi-das.jpg',
      socials: {
        linkedin: '',
        github: '',
        instagram: '',
      },
    },
  ];
  
  export default TEAM_MEMBERS;